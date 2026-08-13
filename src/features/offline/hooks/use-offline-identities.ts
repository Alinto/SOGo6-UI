'use client'

import type { Identity } from '@/features/user-profile/profile-types'
import { useEffect, useState } from 'react'
import { getAuthUserId } from '../auth/get-auth-token'
import { isPwaOutboxEnabled } from '../flags'
import { loadCachedIdentities } from './use-offline-draft-sync'

/**
 * Cached identities fallback for compose when the profile query has no data
 * (offline cold start). Returns null while loading or when nothing is cached.
 */
export function useOfflineIdentities(skip: boolean): Identity[] | null {
  const [identities, setIdentities] = useState<Identity[] | null>(null)

  useEffect(() => {
    if (skip || !isPwaOutboxEnabled()) return
    const userId = getAuthUserId()
    if (!userId) return
    let cancelled = false
    void loadCachedIdentities(userId).then((cached) => {
      if (!cancelled && cached?.length) setIdentities(cached)
    })
    return () => {
      cancelled = true
    }
  }, [skip])

  return identities
}
