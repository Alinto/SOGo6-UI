'use client'

import type { ImapFolder } from '@/features/mails/mails-types'
import { useEffect, useState } from 'react'
import { isPwaMailCacheEnabled } from '../flags'
import { useMailCache } from './use-mail-cache'

/**
 * Cached folder tree fallback when the folders query has no data
 * (offline cold start, or DevTools Offline with navigator.onLine still true).
 */
export function useOfflineFolders(
  accountId: string,
  skip: boolean
): ImapFolder[] | null {
  const { readFolders } = useMailCache()
  const [cached, setCached] = useState<{
    key: string
    folders: ImapFolder[]
  } | null>(null)

  const active = !skip && isPwaMailCacheEnabled()

  useEffect(() => {
    if (!active) return
    let cancelled = false
    readFolders(accountId)
      .then((folders) => {
        if (cancelled || !Array.isArray(folders)) return
        setCached({ key: accountId, folders: folders as ImapFolder[] })
      })
      .catch((error: unknown) => {
        console.warn('[offline] could not read cached folders', error)
      })
    return () => {
      cancelled = true
    }
  }, [active, accountId, readFolders])

  if (!active || cached?.key !== accountId) return null
  return cached.folders
}
