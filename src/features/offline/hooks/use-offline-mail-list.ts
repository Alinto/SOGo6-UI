'use client'

import type { ImapMessagesList } from '@/features/mails/mails-types'
import { useEffect, useState } from 'react'
import { isPwaMailCacheEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'
import { isNetworkError } from '../utils/is-network-error'
import { useMailCache } from './use-mail-cache'

interface UseOfflineMailListArgs {
  accountId: string
  folderPath: string
  /** Result of the online query (undefined while unavailable). */
  mails: ImapMessagesList[] | undefined
  /** Error of the online query, if any. */
  error: unknown
  /**
   * The list on screen is the plain first page of a real folder, newest
   * first (no search, quick filter, other sort or page, virtual folder):
   * only that list may be mirrored into the folder's offline snapshot.
   */
  writeThrough?: boolean
  /** `mails` is the whole folder (no next page). */
  isComplete?: boolean
}

export interface CacheableListViewArgs {
  page: number
  isSearchActive: boolean
  isVirtualFolder: boolean
  /** `filter` URL param (quick filter). */
  filter: string | null
  /** `sort` URL param. */
  sort: string | null
}

/**
 * Sort values of the list toolbar that keep the folder's default
 * newest-first order (see SORT_PARAM_MAP in use-folder-messages).
 */
const NEWEST_FIRST_SORTS = new Set(['', 't_asc'])

export function isCacheableListView({
  page,
  isSearchActive,
  isVirtualFolder,
  filter,
  sort,
}: CacheableListViewArgs): boolean {
  if (isSearchActive || isVirtualFolder) return false
  if (page !== 1) return false
  if (filter && filter !== 'all') return false
  return NEWEST_FIRST_SORTS.has(sort ?? '')
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
 * Online: the plain first page of a folder is merged into IndexedDB (capped
 * per folder). With no query data, offline or after a network-type error,
 * the cached headers are served instead.
 */
export function useOfflineMailList({
  accountId,
  folderPath,
  mails,
  error,
  writeThrough = false,
  isComplete = false,
}: UseOfflineMailListArgs) {
  const { cacheHeaders, readHeaders } = useMailCache()
  const { isOnline } = useNetworkStatus()
  const cacheKey = `${accountId}:${folderPath}`
  const [cached, setCached] = useState<{
    key: string
    mails: ImapMessagesList[]
    cachedAt: number | null
  } | null>(null)

  useEffect(() => {
    if (!isPwaMailCacheEnabled() || !writeThrough || !mails?.length) return
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
      })),
      { complete: isComplete }
    ).catch((cacheError: unknown) => {
      console.warn('[offline] could not cache mail headers', cacheError)
    })
  }, [accountId, folderPath, mails, cacheHeaders, writeThrough, isComplete])

  const shouldFallback =
    isPwaMailCacheEnabled() && !mails && (isNetworkError(error) || !isOnline)

  useEffect(() => {
    if (!shouldFallback) return
    let cancelled = false
    const key = `${accountId}:${folderPath}`
    readHeaders(accountId, folderPath)
      .catch((readError: unknown) => {
        console.warn('[offline] could not read cached headers', readError)
        return []
      })
      .then((rows) => {
        if (cancelled) return
        const parsed: ImapMessagesList[] = []
        let cachedAt: number | null = null
        for (const row of rows) {
          try {
            parsed.push(JSON.parse(row.payloadJson) as ImapMessagesList)
          } catch {
            // Corrupted row — skip it
          }
          if (cachedAt === null || row.updatedAt > cachedAt) {
            cachedAt = row.updatedAt
          }
        }
        setCached({ key, mails: sortByDateDesc(parsed), cachedAt })
      })
    return () => {
      cancelled = true
    }
  }, [shouldFallback, accountId, folderPath, readHeaders])

  const cachedMails =
    shouldFallback && cached?.key === cacheKey ? cached.mails : null

  return {
    cachedMails,
    cachedAt: cachedMails !== null ? (cached?.cachedAt ?? null) : null,
    isShowingCache: cachedMails !== null,
  }
}
