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
 * Returns null data when the mail was never cached ("unavailable offline").
 */
export function useOfflineMailBody<T>({
  accountId,
  folderPath,
  mailId,
  active,
}: UseOfflineMailBodyArgs): { data: T | null; isLoading: boolean } {
  const cacheKey = `${accountId}:${folderPath}:${mailId}`
  const [result, setResult] = useState<{
    key: string
    payload: unknown
  } | null>(null)
  const { readBody } = useMailCache()

  const enabled = active && isPwaMailCacheEnabled()

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void readBody(accountId, folderPath, mailId).then((payload) => {
      if (cancelled) return
      setResult({
        key: `${accountId}:${folderPath}:${mailId}`,
        payload: payload ?? null,
      })
    })
    return () => {
      cancelled = true
    }
  }, [enabled, accountId, folderPath, mailId, readBody])

  if (!enabled) return { data: null, isLoading: false }
  if (!result || result.key !== cacheKey) {
    return { data: null, isLoading: true }
  }
  return { data: (result.payload as T) ?? null, isLoading: false }
}
