'use client'

import type { ImapFolder } from '@/features/mails/mails-types'
import { useEffect, useState } from 'react'
import { isPwaMailCacheEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'
import { useMailCache } from './use-mail-cache'

/**
 * Cached folder tree fallback for the mail sidebar (offline cold start).
 */
export function useOfflineFolders(
  accountId: string,
  skip: boolean
): ImapFolder[] | null {
  const { readFolders } = useMailCache()
  const { isOnline } = useNetworkStatus()
  const [cached, setCached] = useState<{
    key: string
    folders: ImapFolder[]
  } | null>(null)

  const active = !skip && !isOnline && isPwaMailCacheEnabled()

  useEffect(() => {
    if (!active) return
    let cancelled = false
    void readFolders(accountId).then((folders) => {
      if (cancelled || !Array.isArray(folders)) return
      setCached({ key: accountId, folders: folders as ImapFolder[] })
    })
    return () => {
      cancelled = true
    }
  }, [active, accountId, readFolders])

  if (!active || cached?.key !== accountId) return null
  return cached.folders
}
