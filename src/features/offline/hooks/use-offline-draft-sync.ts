'use client'

import { createDraft } from '@/features/mails/store/mail-compose-slice'
import type { Identity } from '@/features/user-profile/profile-types'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useEffect, useRef } from 'react'
import { getAuthUserId } from '../auth/get-auth-token'
import { listLocalDrafts, upsertLocalDraft } from '../db/drafts-store'
import { getMetaIdentities, saveMetaIdentities } from '../db/mail-cache-store'
import { wipeOfflineUserData } from '../db/wipe'
import { isPwaOutboxEnabled } from '../flags'
import type { LocalDraftRecord } from '../types'

/**
 * Hydrate Redux compose drafts from IndexedDB on boot; dual-write helper.
 */
export function useOfflineDraftHydration() {
  const dispatch = useAppDispatch()
  const openDraftIds = useAppSelector((s) => s.mailCompose.openDraftIds)
  const didHydrate = useRef(false)

  useEffect(() => {
    if (!isPwaOutboxEnabled() || didHydrate.current) return
    didHydrate.current = true
    const userId = getAuthUserId()
    if (!userId) return

    void (async () => {
      const drafts = await listLocalDrafts(userId)
      for (const d of drafts) {
        if (openDraftIds.includes(d.id)) continue
        dispatch(
          createDraft({
            draftId: d.id,
            initialData: {
              mailKey: d.mailKey,
              to: d.to,
              cc: d.cc,
              bcc: d.bcc,
              subject: d.subject,
              body: d.body,
              isPlainText: d.isPlainText,
              priority: d.priority as 0 | 1 | 2 | 3 | 4,
              requestReadReceipt: d.requestReadReceipt,
              selectedSignatureKey: d.signatureKey,
            },
          })
        )
      }
    })()
  }, [dispatch, openDraftIds])
}

export async function persistLocalDraft(
  partial: Omit<LocalDraftRecord, 'createdAt' | 'updatedAt'> & {
    createdAt?: number
  }
): Promise<void> {
  if (!isPwaOutboxEnabled()) return
  const now = Date.now()
  await upsertLocalDraft({
    ...partial,
    createdAt: partial.createdAt ?? now,
    updatedAt: now,
  })
}

export async function cacheIdentities(
  userId: string,
  identities: Identity[]
): Promise<void> {
  if (!isPwaOutboxEnabled()) return
  await saveMetaIdentities({
    id: userId,
    userId,
    payloadJson: JSON.stringify(identities),
    updatedAt: Date.now(),
  })
}

export async function loadCachedIdentities(
  userId: string
): Promise<Identity[] | null> {
  const row = await getMetaIdentities(userId)
  if (!row) return null
  try {
    return JSON.parse(row.payloadJson) as Identity[]
  } catch {
    return null
  }
}

export async function wipeOnLogout(userId: string | null | undefined) {
  if (!userId) return
  await wipeOfflineUserData(userId)
}
