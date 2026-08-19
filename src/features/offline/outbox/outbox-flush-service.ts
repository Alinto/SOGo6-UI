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
import type { OutboxRecord } from '../types'
import { blobToBase64 } from '../utils/blob-to-base64'
import { notifyOutboxChanged } from './outbox-events'

export type FlushResult = {
  sent: number
  failed: number
  pausedAuth: boolean
  errors: string[]
}

const flushLocks = new Map<string, Promise<FlushResult>>()

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

async function sendOutboxItem(
  item: OutboxRecord,
  token: string,
  base: string
): Promise<{ ok: boolean; status: number; message?: string }> {
  const attachments = await getOutboxAttachments(item.userId, item.id)
  const attachmentPayload = await Promise.all(
    attachments.map(async (a) => ({
      filename: a.name,
      contentType: a.type,
      content: await blobToBase64(a.blob),
    }))
  )

  // Same URL scheme and body contract as the online sendMail mutation
  // (SendMailBody in mail-api-types.ts) so backend behaviour is identical.
  const url =
    item.mailKey != null
      ? `${base}/mailboxes/${item.accountId}/mail/${encodeURIComponent(item.mailKey)}/send`
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
    attachments: attachmentPayload.length ? attachmentPayload : undefined,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (res.ok) {
    // Backend wraps responses in BackendResponse — an HTTP 200 can still
    // carry an application-level error code.
    try {
      const json = (await res.json()) as {
        error_code?: string
        error_msg?: string
      }
      if (json.error_code && json.error_code !== 'S000000') {
        return {
          ok: false,
          status: res.status,
          message: json.error_msg ?? json.error_code,
        }
      }
    } catch {
      // No JSON body — treat HTTP 2xx as success
    }
    return { ok: true, status: res.status }
  }

  let message = `HTTP ${res.status}`
  try {
    const json = (await res.json()) as { error_msg?: string }
    if (json.error_msg) message = json.error_msg
  } catch {
    // ignore
  }
  return { ok: false, status: res.status, message }
}

function isFakeApiBase(base: string): boolean {
  return base === '/fakeApi' || base.endsWith('/fakeApi')
}

async function runFlush(userId: string): Promise<FlushResult> {
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
  // The per-user lock guarantees no flush is running concurrently in this tab.
  for (const stale of all.filter((i) => i.status === 'sending')) {
    await updateOutboxStatus(userId, stale.id, 'pending', {
      lastError: 'interrupted',
    })
    stale.status = 'pending'
  }

  const items = all.filter(
    (i) => i.status === 'pending' || i.status === 'failed'
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

function runFlushExclusive(userId: string): Promise<FlushResult> {
  // Web Locks (when available) prevent a double send across tabs / windows
  // of the same origin; the in-memory lock covers the current tab.
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
  if (locks?.request) {
    return locks.request(`sogo-outbox-flush-${userId}`, () => runFlush(userId))
  }
  return runFlush(userId)
}

/**
 * Flush pending outbox items one-by-one, with per-user in-memory +
 * cross-tab locking (no double send).
 */
export function flushOutbox(userId: string): Promise<FlushResult> {
  const existing = flushLocks.get(userId)
  if (existing) return existing
  const promise = runFlushExclusive(userId)
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
