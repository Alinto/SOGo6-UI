import { toast } from 'sonner'
import {
  flushOutbox,
  type FlushOutboxOptions,
  type FlushResult,
} from './outbox-flush-service'

type Translate = (key: string, values?: Record<string, number>) => string

let toastedPromise: Promise<FlushResult> | null = null

function notifyFlushResult(result: FlushResult, t: Translate) {
  if (result.pausedAuth) {
    toast.warning(t('outbox_auth_required.string'))
    return
  }
  if (result.sent > 0) {
    toast.success(t('outbox_flush_success.string', { count: result.sent }))
    return
  }
  if (result.failed > 0) {
    toast.error(t('outbox_flush_failed.string'))
  }
}

/**
 * Flush the outbox and toast once per in-flight flush (SW + React can both
 * call this with the same lock promise).
 */
export function flushOutboxWithToasts(
  userId: string,
  t: Translate,
  options?: FlushOutboxOptions
): Promise<FlushResult> {
  const promise = flushOutbox(userId, options)
  if (promise === toastedPromise) return promise
  toastedPromise = promise
  return promise.then((result) => {
    notifyFlushResult(result, t)
    return result
  })
}
