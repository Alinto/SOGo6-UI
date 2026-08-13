'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getAuthUserId } from '../auth/get-auth-token'
import { isPwaOutboxEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'
import { flushOutbox } from '../outbox/outbox-flush-service'

/**
 * Triggers outbox flush on cold start and on every offline→online transition.
 * iOS relies on this path exclusively (no Background Sync).
 */
export function useOutboxFlushTriggers(enabled = true) {
  const { isOnline } = useNetworkStatus()
  const t = useTranslations('PWA')
  const prevOnline = useRef<boolean | null>(null)

  useEffect(() => {
    if (!enabled || !isPwaOutboxEnabled()) return

    const wasOnline = prevOnline.current
    prevOnline.current = isOnline

    // Flush on cold start (first render while online) and when connectivity
    // comes back (false → true transition observed through useNetworkStatus).
    const shouldFlush = isOnline && (wasOnline === null || wasOnline === false)
    if (!shouldFlush) return

    const userId = getAuthUserId()
    if (!userId) return

    void flushOutbox(userId).then((result) => {
      if (result.pausedAuth) {
        toast.warning(t('outbox_auth_required.string'))
      } else if (result.sent > 0) {
        toast.success(t('outbox_flush_success.string', { count: result.sent }))
      } else if (result.failed > 0) {
        toast.error(t('outbox_flush_failed.string'))
      }
    })
  }, [enabled, isOnline, t])
}
