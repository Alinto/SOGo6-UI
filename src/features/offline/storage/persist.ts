import { getKv, setKv } from '../db/kv-store'
import { KV_PERSIST_ASKED_AT, PERSIST_RETRY_MS } from '../types'

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

/** Ask once, then retry after PERSIST_RETRY_MS if the browser still refused. */
export async function requestPersistentStorageOnce(
  userId: string,
  now = Date.now()
): Promise<boolean> {
  if (!userId) return false
  const asked = await getKv(userId, KV_PERSIST_ASKED_AT)
  if (asked != null) {
    try {
      const persisted = (await navigator.storage?.persisted?.()) ?? false
      if (persisted) return true
    } catch {
      // continue cooldown check
    }
    const askedAt = Number(asked)
    if (Number.isFinite(askedAt) && now - askedAt < PERSIST_RETRY_MS) {
      return false
    }
  }
  const persisted = await requestPersistentStorage()
  await setKv(userId, KV_PERSIST_ASKED_AT, now)
  return persisted
}
