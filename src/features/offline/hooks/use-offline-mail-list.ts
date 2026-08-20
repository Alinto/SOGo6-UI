'use client'

import type { ImapMessagesList } from '@/features/mails/mails-types'
import { useEffect, useState } from 'react'
import { isPwaMailCacheEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'
import { useMailCache } from './use-mail-cache'

interface UseOfflineMailListArgs {
  accountId: string
  folderPath: string
  /** Result of the online query (undefined while unavailable). */
  mails: ImapMessagesList[] | undefined
  hasError: boolean
}

function sortByDateDesc(mails: ImapMessagesList[]): ImapMessagesList[] {
  return [...mails].sort((a, b) => {
    const da = Date.parse(a.date)
    const db = Date.parse(b.date)
    if (Number.isNaN(da) || Number.isNaN(db)) return 0
    return db - da
  })
}

/**
 * Write-through cache of folder mail headers + offline read fallback.
 * Online: every fetched page is mirrored to IndexedDB (capped per folder).
 * Offline with no query data: the cached headers are served instead.
 */
export function useOfflineMailList({
  accountId,
  folderPath,
  mails,
  hasError,
}: UseOfflineMailListArgs) {
  const { cacheHeaders, readHeaders } = useMailCache()
  const { isOnline } = useNetworkStatus()
  const cacheKey = `${accountId}:${folderPath}`
  const [cached, setCached] = useState<{
    key: string
    mails: ImapMessagesList[]
  } | null>(null)

  useEffect(() => {
    if (!isPwaMailCacheEnabled() || !mails?.length) return
    void cacheHeaders(
      accountId,
      folderPath,
      mails.map((m) => ({
        accountId,
        folderPath,
        mailId: m.id,
        subject: m.subject,
        from: m.from?.email ?? '',
        date: m.date,
        seen: m.seen,
        hasAttachment: m.hasAttachment,
        payloadJson: JSON.stringify(m),
      }))
    )
  }, [accountId, folderPath, mails, cacheHeaders])

  const shouldFallback =
    isPwaMailCacheEnabled() && !mails && (hasError || !isOnline)

  useEffect(() => {
    if (!shouldFallback) return
    let cancelled = false
    void readHeaders(accountId, folderPath).then((rows) => {
      if (cancelled) return
      const parsed: ImapMessagesList[] = []
      for (const row of rows) {
        try {
          parsed.push(JSON.parse(row.payloadJson) as ImapMessagesList)
        } catch {
          // Corrupted row — skip it
        }
      }
      setCached({
        key: `${accountId}:${folderPath}`,
        mails: sortByDateDesc(parsed),
      })
    })
    return () => {
      cancelled = true
    }
  }, [shouldFallback, accountId, folderPath, readHeaders])

  const cachedMails =
    shouldFallback && cached?.key === cacheKey ? cached.mails : null

  return {
    cachedMails,
    isShowingCache: cachedMails !== null,
  }
}
