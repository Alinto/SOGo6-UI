'use client'

import { useEffect, useState } from 'react'
import { isPwaMailCacheEnabled } from '../flags'
import { useMailCache } from './use-mail-cache'

interface UseOfflineMailBodyArgs {
  accountId: string
  folderPath: string
  mailId: string
  /** Engage the fallback (offline and the online query has no data). */
  active: boolean
}

/**
 * Read a previously opened mail body from the offline cache.
 * Returns null data when the mail was never cached ("unavailable offline");
 * `cachedAt` is when the cached copy was stored.
 */
export function useOfflineMailBody<T>({
  accountId,
  folderPath,
  mailId,
  active,
}: UseOfflineMailBodyArgs): {
  data: T | null
  isLoading: boolean
  cachedAt: number | null
} {
  const cacheKey = `${accountId}:${folderPath}:${mailId}`
  const [result, setResult] = useState<{
    key: string
    payload: unknown
    cachedAt: number | null
  } | null>(null)
  const { readBodyEntry } = useMailCache()

  const enabled = active && isPwaMailCacheEnabled()

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const key = `${accountId}:${folderPath}:${mailId}`
    readBodyEntry(accountId, folderPath, mailId)
      .catch((error: unknown) => {
        console.warn('[offline] could not read cached mail', error)
        return null
      })
      .then((entry) => {
        if (cancelled) return
        setResult({
          key,
          payload: entry?.payload ?? null,
          cachedAt: entry?.cachedAt ?? null,
        })
      })
    return () => {
      cancelled = true
    }
  }, [enabled, accountId, folderPath, mailId, readBodyEntry])

  if (!enabled) return { data: null, isLoading: false, cachedAt: null }
  if (!result || result.key !== cacheKey) {
    return { data: null, isLoading: true, cachedAt: null }
  }
  return {
    data: (result.payload as T) ?? null,
    isLoading: false,
    cachedAt: result.payload ? result.cachedAt : null,
  }
}
