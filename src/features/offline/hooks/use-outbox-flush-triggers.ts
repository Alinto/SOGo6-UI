'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { getAuthUserId } from '../auth/get-auth-token'
import { isPwaOutboxEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'
import { flushOutboxWithToasts } from '../outbox/outbox-flush-feedback'

/**
 * Triggers outbox flush on cold start and on every offline→online transition.
 * iOS relies on this path exclusively (no Background Sync).
 */
export function useOutboxFlushTriggers(enabled = true) {
  const { isOnline, isProbing } = useNetworkStatus()
  const t = useTranslations('PWA')
  const prevOnline = useRef<boolean | null>(null)

  useEffect(() => {
    if (!enabled || !isPwaOutboxEnabled()) return
    if (isProbing) return

    const wasOnline = prevOnline.current
    prevOnline.current = isOnline

    // Flush on cold start (first settled online render) and when connectivity
    // comes back (false → true transition observed through useNetworkStatus).
    const shouldFlush = isOnline && (wasOnline === null || wasOnline === false)
    if (!shouldFlush) return

    const userId = getAuthUserId()
    if (!userId) return

    void flushOutboxWithToasts(userId, t)
  }, [enabled, isOnline, isProbing, t])
}
