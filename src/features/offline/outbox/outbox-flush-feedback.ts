import { toast } from 'sonner'
import {
  flushOutbox,
  type FlushOutboxOptions,
  type FlushResult,
} from './outbox-flush-service'

type Translate = (key: string, values?: Record<string, number>) => string

let toasted: { raw: Promise<FlushResult>; safe: Promise<FlushResult> } | null =
  null

function notifyFlushResult(result: FlushResult, t: Translate) {
  if (result.pausedAuth) {
    toast.warning(t('outbox_auth_required.string'))
    return
  }
  if (result.interrupted > 0) {
    // Possibly delivered: warn before the user forces a resend.
    toast.warning(t('outbox_flush_unknown_outcome.string'))
  }
  if (result.sent > 0) {
    toast.success(t('outbox_flush_success.string', { count: result.sent }))
    return
  }
  if (result.failed > result.interrupted) {
    toast.error(t('outbox_flush_failed.string'))
  }
}

function emptyResult(error: string): FlushResult {
  return {
    sent: 0,
    failed: 0,
    interrupted: 0,
    pausedAuth: false,
    errors: [error],
  }
}

/**
 * Flush the outbox and toast once per in-flight flush (SW + React can both
 * call this with the same lock promise). Never rejects: callers fire and
 * forget it (`void flushOutboxWithToasts(...)`).
 */
export function flushOutboxWithToasts(
  userId: string,
  t: Translate,
  options?: FlushOutboxOptions
): Promise<FlushResult> {
  let raw: Promise<FlushResult>
  try {
    raw = flushOutbox(userId, options)
  } catch (error) {
    raw = Promise.reject(error)
  }
  if (toasted?.raw === raw) return toasted.safe
  const safe = raw.then(
    (result) => {
      notifyFlushResult(result, t)
      return result
    },
    (error: unknown) => {
      // e.g. IndexedDB closed by a logout wipe while flushing.
      console.error('Outbox flush failed', error)
      toast.error(t('outbox_flush_failed.string'))
      return emptyResult('flush_error')
    }
  )
  toasted = { raw, safe }
  return safe
}
