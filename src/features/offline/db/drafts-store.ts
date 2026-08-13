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
