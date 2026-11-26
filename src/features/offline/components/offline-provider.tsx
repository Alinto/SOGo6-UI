'use client'

import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import {
  isPwaEnabled,
  isPwaMailCacheEnabled,
  isPwaOutboxEnabled,
} from '@/features/offline/flags'
import { flushOutboxWithToasts } from '@/features/offline/outbox/outbox-flush-feedback'
import { requestPersistentStorageOnce } from '@/features/offline/storage/persist'
import { useTranslations } from 'next-intl'
import { memo, type ReactNode, useEffect } from 'react'
import { purgeExpiredCache } from '../db/mail-cache-store'
import { holdActiveOwnerLock, wipeOtherUsersOfflineData } from '../db/wipe'
import { useOfflineDraftHydration } from '../hooks/use-offline-draft-sync'
import { useOutboxFlushTriggers } from '../hooks/use-outbox-flush-triggers'
import { OfflineNavProvider } from '../offline-nav-context'
import PwaStatusBar from './pwa-status-bar'
import PwaUpdateToast from './pwa-update-toast'

/** Re-run the TTL purge while the app stays open. */
const OFFLINE_PURGE_INTERVAL_MS = 60 * 60 * 1000

function warn(label: string) {
  return (error: unknown) => {
    console.warn(`[offline] ${label} failed`, error)
  }
}

interface OfflineProviderProps {
  children: ReactNode
}

function OfflineProviderInner({ children }: OfflineProviderProps) {
  const t = useTranslations('PWA')
  useOfflineDraftHydration()
  useOutboxFlushTriggers(true)

  useEffect(() => {
    const userId = getAuthUserId()
    if (!userId) return
    const releaseOwnerLock = holdActiveOwnerLock(userId)
    // Shared device: another account that never logged out must not keep
    // its offline data (mail, drafts, outbox) here.
    void wipeOtherUsersOfflineData(userId).catch(warn('stale account wipe'))
    if (isPwaEnabled()) {
      void requestPersistentStorageOnce(userId).catch(
        warn('persistent storage request')
      )
    }
    if (!isPwaMailCacheEnabled()) return releaseOwnerLock

    const purge = () => {
      const owner = getAuthUserId()
      if (!owner) return
      void purgeExpiredCache(owner).catch(warn('cache purge'))
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') purge()
    }
    purge()
    const interval = window.setInterval(purge, OFFLINE_PURGE_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', purge)
    return () => {
      releaseOwnerLock()
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('online', purge)
    }
  }, [])

  useEffect(() => {
    if (!isPwaOutboxEnabled()) return
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'OUTBOX_FLUSH') return
      const userId = getAuthUserId()
      if (!userId) return
      void Promise.resolve()
        .then(() => flushOutboxWithToasts(userId, t))
        .catch(warn('outbox flush'))
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
