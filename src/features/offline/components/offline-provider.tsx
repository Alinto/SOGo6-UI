'use client'

import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import {
  isPwaEnabled,
  isPwaMailCacheEnabled,
  isPwaOutboxEnabled,
} from '@/features/offline/flags'
import { flushOutboxWithToasts } from '@/features/offline/outbox/outbox-flush-feedback'
import { useTranslations } from 'next-intl'
import { memo, type ReactNode, useEffect } from 'react'
import { purgeExpiredCache } from '../db/mail-cache-store'
import { useOfflineDraftHydration } from '../hooks/use-offline-draft-sync'
import { useOutboxFlushTriggers } from '../hooks/use-outbox-flush-triggers'
import { OfflineNavProvider } from '../offline-nav-context'
import PwaStatusBar from './pwa-status-bar'
import PwaUpdateToast from './pwa-update-toast'

interface OfflineProviderProps {
  children: ReactNode
}

function OfflineProviderInner({ children }: OfflineProviderProps) {
  const t = useTranslations('PWA')
  useOfflineDraftHydration()
  useOutboxFlushTriggers(true)

  useEffect(() => {
    if (!isPwaMailCacheEnabled()) return
    const userId = getAuthUserId()
    if (!userId) return
    void purgeExpiredCache(userId)
  }, [])

  useEffect(() => {
    if (!isPwaOutboxEnabled()) return
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'OUTBOX_FLUSH') return
      const userId = getAuthUserId()
      if (!userId) return
      void flushOutboxWithToasts(userId, t)
    }
    navigator.serviceWorker?.addEventListener('message', onMessage)
    return () => {
      navigator.serviceWorker?.removeEventListener('message', onMessage)
    }
  }, [t])

  return (
    <>
      <PwaStatusBar />
      <PwaUpdateToast />
      {children}
    </>
  )
}

function OfflineProvider({ children }: OfflineProviderProps) {
  const inner = isPwaEnabled() ? (
    <OfflineProviderInner>{children}</OfflineProviderInner>
  ) : (
    children
  )
  return <OfflineNavProvider>{inner}</OfflineNavProvider>
}

export default memo(OfflineProvider)
