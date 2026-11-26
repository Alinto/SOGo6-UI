import { fetchEnvVars } from '@/lib/env-service'
import {
  getAuthToken,
  isJwtExpired,
  readStoredAuth,
} from '../auth/get-auth-token'
import {
  claimOutboxForSend,
  deleteOutboxItem,
  getOutboxAttachments,
  getOutboxItem,
  listOutbox,
  markOutboxAttachmentUploaded,
  updateOutboxStatus,
} from '../db/outbox-store'
import { isPwaOutboxEnabled } from '../flags'
import { probeNetwork } from '../network/probe'
import {
  OUTBOX_FLUSH_MAX_RETRIES,
  OUTBOX_INTERRUPTED_ERROR,
  OUTBOX_SEND_TIMEOUT_MS,
  OUTBOX_UPLOAD_MIN_BYTES_PER_SEC,
  OUTBOX_UPLOAD_TIMEOUT_BASE_MS,
  type OutboxAttachmentRecord,
  type OutboxRecord,
} from '../types'
import { registerBackgroundSync } from './outbox-coordinator'
import { isOutboxEditHoldLive } from './outbox-edit-hold'
import { notifyOutboxChanged } from './outbox-events'

export type FlushResult = {
  sent: number
  /** Items whose attempt did not succeed in this run (any reason). */
  failed: number
  /**
   * Subset of `failed` whose /send outcome is unknown (network error or
   * timeout after the request left): they may have been delivered, so they
   * are parked as interrupted and only "Send all" retries them.
   */
  interrupted: number
  pausedAuth: boolean
  errors: string[]
}

type FlushEntry = { promise: Promise<FlushResult>; force: boolean }

const flushLocks = new Map<string, FlushEntry>()
const queuedForcedFlushes = new Map<string, Promise<FlushResult>>()

type ApiJson = {
  error_code?: string | number
  error_msg?: string
  data?: { key?: string; filename?: string }
}

type SendResult = {
  ok: boolean
  status: number
  message?: string
  key?: string
}

/** Tracks how far a send went, to tell a safe retry from an unknown outcome. */
type SendProgress = { sendIssued: boolean }

/**
 * Resolve the API base URL exactly like RTK's dynamicBaseQuery does
 * (runtime /env → REACT_APP_API_BASE_URL, dev fallback /fakeApi).
 */
async function resolveApiBase(): Promise<string | null> {
  try {
    const envVars = await fetchEnvVars()
    const fromEnv = envVars.REACT_APP_API_BASE_URL?.trim()
    if (fromEnv) return fromEnv.replace(/\/$/, '')
  } catch {
    // fall through to dev fallback
  }
  return process.env.NODE_ENV === 'production' ? null : '/fakeApi'
}

async function readApiJson(res: Response): Promise<ApiJson | null> {
  try {
    return (await res.json()) as ApiJson
  } catch {
    return null
  }
}

function apiErrorMessage(json: ApiJson | null, fallback: string): string {
  return json?.error_msg || fallback
}

function isApiError(json: ApiJson | null): boolean {
  if (!json?.error_code && json?.error_code !== 0) return false
  return json.error_code !== 'S000000' && json.error_code !== 0
}

function toSendFile(attachment: OutboxAttachmentRecord): File {
  return new File([attachment.blob], attachment.name, {
    type: attachment.type || 'application/octet-stream',
  })
}

export function uploadTimeoutMs(size: number): number {
  return (
    OUTBOX_UPLOAD_TIMEOUT_BASE_MS +
    Math.ceil((size / OUTBOX_UPLOAD_MIN_BYTES_PER_SEC) * 1000)
  )
}

/**
 * fetch + JSON body under one deadline, so a hung request cannot hold the
 * flush Web Lock forever. Rejects (AbortError) on timeout.
 */
async function postWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<{ res: Response; json: ApiJson | null }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    const json = await readApiJson(res)
    // Body read cut by the deadline: the response is incomplete.
    if (json === null && controller.signal.aborted) {
      throw new DOMException('Request timed out', 'AbortError')
    }
    return { res, json }
  } finally {
    clearTimeout(timer)
  }
}

async function uploadDraftAttachment(
  base: string,
  token: string,
  accountId: string,
  mailKey: string | null,
  file: File
): Promise<SendResult> {
  const url =
    mailKey != null
      ? `${base}/mailboxes/${accountId}/mail/${encodeURIComponent(mailKey)}/attachments`
      : `${base}/mailboxes/${accountId}/mail/attachments`
  const form = new FormData()
  form.append('file', file)
  const { res, json } = await postWithTimeout(
    url,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
    uploadTimeoutMs(file.size)
  )
  if (!res.ok || isApiError(json)) {
    return {
      ok: false,
      status: res.status,
      message: apiErrorMessage(json, `HTTP ${res.status}`),
    }
  }
  return { ok: true, status: res.status, key: json?.data?.key }
}

async function sendOutboxItem(
  item: OutboxRecord,
  token: string,
  base: string,
  progress: SendProgress
): Promise<SendResult> {
  const attachments = await getOutboxAttachments(item.userId, item.id)
  let mailKey = item.mailKey

  for (const attachment of attachments) {
    // Already on the server draft (online upload before queueing, or a
    // previous flush attempt): the server appends every upload.
    if (attachment.uploaded && mailKey != null) continue
    const uploaded = await uploadDraftAttachment(
      base,
      token,
      item.accountId,
      mailKey,
      toSendFile(attachment)
    )
    if (!uploaded.ok) return uploaded
    if (uploaded.key) mailKey = uploaded.key
    if (mailKey == null) {
      return {
        ok: false,
        status: 500,
        message: 'attachment_upload_no_key',
      }
    }
    await markOutboxAttachmentUploaded(
      item.userId,
      item.id,
      attachment.id,
      mailKey
    )
  }

  const url =
    mailKey != null
      ? `${base}/mailboxes/${item.accountId}/mail/${encodeURIComponent(mailKey)}/send`
      : `${base}/mailboxes/${item.accountId}/mail/send`

  const body = {
    from: item.identityMail,
    to: item.to.map((r) => r.email),
    cc: item.cc.map((r) => r.email),
    bcc: item.bcc.map((r) => r.email),
    subject: item.subject,
    body: item.body,
    return_receipt: item.requestReadReceipt ? true : null,
    priority: item.priority,
    is_html: !item.isPlainText,
    reply_to: item.replyTo ?? null,
  }

  // From here on a network failure leaves the outcome unknown.
  progress.sendIssued = true
  const { res, json } = await postWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
    OUTBOX_SEND_TIMEOUT_MS
  )
  if (!res.ok || isApiError(json)) {
    return {
      ok: false,
      status: res.status,
      message: apiErrorMessage(json, `HTTP ${res.status}`),
    }
  }
  return { ok: true, status: res.status }
}

function isFakeApiBase(base: string): boolean {
  return base === '/fakeApi' || base.endsWith('/fakeApi')
}

export type FlushOutboxOptions = {
  /** Manual send-all: retry interrupted / cap-exceeded failed items. */
  force?: boolean
}

function shouldAutoFlushItem(item: OutboxRecord): boolean {
  if (item.status === 'pending') return true
  if (item.status !== 'failed') return false
  if (item.lastError === OUTBOX_INTERRUPTED_ERROR) return false
  if (item.retryCount >= OUTBOX_FLUSH_MAX_RETRIES) return false
  return true
}

function canFlushItem(item: OutboxRecord, force: boolean): boolean {
  return force
    ? item.status === 'pending' || item.status === 'failed'
    : shouldAutoFlushItem(item)
}

/**
 * Re-read the record right before sending (it may have been edited, held
 * or sent since the list was read) and claim it atomically.
 */
async function claimFreshItem(
  userId: string,
  id: string,
  force: boolean
): Promise<OutboxRecord | null> {
  const snapshot = await getOutboxItem(userId, id)
  if (!snapshot || !canFlushItem(snapshot, force)) return null
  if (await isOutboxEditHoldLive(snapshot)) return null
  return claimOutboxForSend(userId, snapshot, (current) =>
    canFlushItem(current, force)
  )
}

/** A gateway timeout may hide a delivered message. */
function isUnknownOutcomeStatus(status: number): boolean {
  return status === 504
}

async function markInterrupted(
  userId: string,
  item: OutboxRecord,
  result: FlushResult
): Promise<void> {
  await updateOutboxStatus(userId, item.id, 'failed', {
    retryCount: item.retryCount + 1,
    lastError: OUTBOX_INTERRUPTED_ERROR,
  })
  result.failed += 1
  result.interrupted += 1
  result.errors.push('send_outcome_unknown')
}

async function runFlush(userId: string, force = false): Promise<FlushResult> {
  const result: FlushResult = {
    sent: 0,
    failed: 0,
    interrupted: 0,
    pausedAuth: false,
    errors: [],
  }

  if (!isPwaOutboxEnabled()) return result

  const online = await probeNetwork()
  if (!online) {
    result.errors.push('offline')
    return result
  }

  const auth = readStoredAuth()
  const token = auth?.token ?? getAuthToken()
  if (!token) {
    result.pausedAuth = true
    result.errors.push('auth_expired')
    return result
  }

  const base = await resolveApiBase()
  if (!base) {
    result.errors.push('api_base_unresolved')
    return result
  }

  // fakeApi login JWTs are unsigned fixtures; their `exp` is often stale.
  // Do not block the outbox on expiry when we are not hitting a real API.
  if (!isFakeApiBase(base) && isJwtExpired(token)) {
    result.pausedAuth = true
    result.errors.push('auth_expired')
    return result
  }

  const all = await listOutbox(userId)

  // Recover items stuck in 'sending' after a killed page / crashed flush.
  // Mark failed (not pending) so auto-flush will not blindly resend.
  for (const stale of all.filter((i) => i.status === 'sending')) {
    await updateOutboxStatus(userId, stale.id, 'failed', {
      lastError: OUTBOX_INTERRUPTED_ERROR,
    })
    stale.status = 'failed'
    stale.lastError = OUTBOX_INTERRUPTED_ERROR
  }

  const candidates = all.filter((i) => canFlushItem(i, force))

  for (const candidate of candidates) {
    const item = await claimFreshItem(userId, candidate.id, force)
    if (!item) continue
    const progress: SendProgress = { sendIssued: false }
    try {
      const sendResult = await sendOutboxItem(item, token, base, progress)
      if (sendResult.ok) {
        await deleteOutboxItem(userId, item.id)
        result.sent += 1
        continue
      }
      if (sendResult.status === 401) {
        await updateOutboxStatus(userId, item.id, 'pending', {
          lastError: 'auth_expired',
        })
        result.pausedAuth = true
        result.errors.push('auth_expired')
        break
      }
      if (progress.sendIssued && isUnknownOutcomeStatus(sendResult.status)) {
        await markInterrupted(userId, item, result)
        continue
      }
      const retryCount = item.retryCount + 1
      await updateOutboxStatus(userId, item.id, 'failed', {
        retryCount,
        lastError: sendResult.message ?? 'send_failed',
      })
      result.failed += 1
      result.errors.push(sendResult.message ?? 'send_failed')
    } catch (err) {
      if (progress.sendIssued) {
        // The server may have accepted /send before the connection dropped
        // or timed out: never auto-resend, like a stale 'sending' item.
        await markInterrupted(userId, item, result)
      } else {
        // Failed before /send left: safe to retry, but within the cap.
        const retryCount = item.retryCount + 1
        await updateOutboxStatus(
          userId,
          item.id,
          retryCount >= OUTBOX_FLUSH_MAX_RETRIES ? 'failed' : 'pending',
          {
            retryCount,
            lastError: err instanceof Error ? err.message : 'network_error',
          }
        )
        result.failed += 1
        result.errors.push('network_error')
      }
      break
    }
  }

  return result
}

function runFlushExclusive(
  userId: string,
  force: boolean
): Promise<FlushResult> {
  // Web Locks (when available) prevent a double send across tabs / windows
  // of the same origin; the in-memory lock covers the current tab.
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
  if (locks?.request) {
    return locks.request(`sogo-outbox-flush-${userId}`, () =>
      runFlush(userId, force)
    )
  }
  return runFlush(userId, force)
}

/**
 * The browser fires a sync as soon as it believes it is online, so only
 * re-arm it while the browser itself reports offline (otherwise a failing
 * flush would loop: sync → flush → re-register → sync…).
 */
async function rearmBackgroundSyncIfOffline(userId: string): Promise<void> {
  if (typeof navigator === 'undefined' || navigator.onLine !== false) return
  const remaining = await listOutbox(userId)
  if (remaining.some((item) => shouldAutoFlushItem(item))) {
    await registerBackgroundSync()
  }
}

/**
 * Flush pending outbox items one-by-one, with per-user in-memory +
 * cross-tab locking (no double send). A forced run requested while an
 * automatic one is in flight is queued right after it.
 */
export function flushOutbox(
  userId: string,
  options?: FlushOutboxOptions
): Promise<FlushResult> {
  const force = options?.force === true
  const existing = flushLocks.get(userId)
  if (existing) {
    if (!force || existing.force) return existing.promise
    const queued = queuedForcedFlushes.get(userId)
    if (queued) return queued
    const next = existing.promise
      .catch(() => undefined)
      .then(() => {
        queuedForcedFlushes.delete(userId)
        return flushOutbox(userId, options)
      })
    queuedForcedFlushes.set(userId, next)
    return next
  }
  const promise = runFlushExclusive(userId, force)
    .then(async (result) => {
      if (result.sent > 0 || result.failed > 0) notifyOutboxChanged()
      await rearmBackgroundSyncIfOffline(userId).catch(() => undefined)
      return result
    })
    .finally(() => {
      flushLocks.delete(userId)
    })
  flushLocks.set(userId, { promise, force })
  return promise
}
