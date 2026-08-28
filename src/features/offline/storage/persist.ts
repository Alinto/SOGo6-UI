import { getKv, setKv } from '../db/kv-store'
import { KV_PERSIST_ASKED_AT } from '../types'

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false
  }
  try {
    const already = await navigator.storage.persisted?.()
    if (already) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

/** Ask once per user DB. Safari may refuse; that is fine. */
export async function requestPersistentStorageOnce(
  userId: string
): Promise<boolean> {
  if (!userId) return false
  const asked = await getKv(userId, KV_PERSIST_ASKED_AT)
  if (asked != null) {
    try {
      return (await navigator.storage?.persisted?.()) ?? false
    } catch {
      return false
    }
  }
  const persisted = await requestPersistentStorage()
  await setKv(userId, KV_PERSIST_ASKED_AT, Date.now())
  return persisted
}
