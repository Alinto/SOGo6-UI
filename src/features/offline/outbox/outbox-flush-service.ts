import { fetchEnvVars } from '@/lib/env-service'
import {
  getAuthToken,
  isJwtExpired,
  readStoredAuth,
} from '../auth/get-auth-token'
import {
  deleteOutboxItem,
  getOutboxAttachments,
  listOutbox,
  updateOutboxStatus,
} from '../db/outbox-store'
import { isPwaOutboxEnabled } from '../flags'
import { probeNetwork } from '../network/probe'
import {
  OUTBOX_FLUSH_MAX_RETRIES,
  OUTBOX_INTERRUPTED_ERROR,
  type OutboxAttachmentRecord,
  type OutboxRecord,
} from '../types'
import { isOutboxHeldForEdit } from './outbox-edit-hold'
import { notifyOutboxChanged } from './outbox-events'

export type FlushResult = {
  sent: number
  failed: number
  pausedAuth: boolean
  errors: string[]
}

const flushLocks = new Map<string, Promise<FlushResult>>()

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
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const json = await readApiJson(res)
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
  base: string
): Promise<SendResult> {
  const attachments = await getOutboxAttachments(item.userId, item.id)
  let mailKey = item.mailKey

  for (const attachment of attachments) {
    const uploaded = await uploadDraftAttachment(
      base,
      token,
      item.accountId,
      mailKey,
      toSendFile(attachment)
    )
    if (!uploaded.ok) return uploaded
    if (uploaded.key) mailKey = uploaded.key
    else if (mailKey == null) {
      return {
        ok: false,
        status: 500,
        message: 'attachment_upload_no_key',
      }
    }
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

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const json = await readApiJson(res)
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

async function runFlush(userId: string, force = false): Promise<FlushResult> {
  const result: FlushResult = {
    sent: 0,
    failed: 0,
    pausedAuth: false,
    errors: [],
  }

  if (!isPwaOutboxEnabled()) return result

  const online = await probeNetwork()
  if (!online) return result

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

  const items = all.filter(
    (i) =>
      !isOutboxHeldForEdit(i.id) &&
      (force
        ? i.status === 'pending' || i.status === 'failed'
        : shouldAutoFlushItem(i))
  )

  for (const item of items) {
    await updateOutboxStatus(userId, item.id, 'sending')
    try {
      const sendResult = await sendOutboxItem(item, token, base)
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
      const retryCount = item.retryCount + 1
      await updateOutboxStatus(userId, item.id, 'failed', {
        retryCount,
        lastError: sendResult.message ?? 'send_failed',
      })
      result.failed += 1
      result.errors.push(sendResult.message ?? 'send_failed')
    } catch (err) {
      await updateOutboxStatus(userId, item.id, 'pending', {
        lastError: err instanceof Error ? err.message : 'network_error',
      })
      result.failed += 1
      result.errors.push('network_error')
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
 * Flush pending outbox items one-by-one, with per-user in-memory +
 * cross-tab locking (no double send).
 */
export function flushOutbox(
  userId: string,
  options?: FlushOutboxOptions
): Promise<FlushResult> {
  const existing = flushLocks.get(userId)
  if (existing) return existing
  const promise = runFlushExclusive(userId, options?.force === true)
    .then((result) => {
      if (result.sent > 0 || result.failed > 0) notifyOutboxChanged()
      return result
    })
    .finally(() => {
      flushLocks.delete(userId)
    })
  flushLocks.set(userId, promise)
  return promise
}
