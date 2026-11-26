import type { LocalDraftRecord } from '../types'
import { getOfflineDb } from './offline-db'

export async function upsertLocalDraft(draft: LocalDraftRecord): Promise<void> {
  const db = getOfflineDb(draft.userId)
  await db.drafts.put(draft)
}

export async function getLocalDraft(
  userId: string,
  id: string
): Promise<LocalDraftRecord | undefined> {
  return getOfflineDb(userId).drafts.get(id)
}

export async function listLocalDrafts(
  userId: string
): Promise<LocalDraftRecord[]> {
  return getOfflineDb(userId).drafts.where('userId').equals(userId).toArray()
}

export async function deleteLocalDraft(
  userId: string,
  id: string
): Promise<void> {
  await getOfflineDb(userId).drafts.delete(id)
}

/**
 * Delete the local mirror only if it is not newer than `savedAt` (the time of
 * the snapshot the server just stored). A save that finished late must not
 * drop a newer local copy written meanwhile. Resolves true when deleted.
 */
export async function deleteLocalDraftIfNotNewer(
  userId: string,
  id: string,
  savedAt: number
): Promise<boolean> {
  const db = getOfflineDb(userId)
  return db.transaction('rw', db.drafts, async () => {
    const existing = await db.drafts.get(id)
    if (!existing) return false
    if (existing.updatedAt > savedAt) return false
    await db.drafts.delete(id)
    return true
  })
}
