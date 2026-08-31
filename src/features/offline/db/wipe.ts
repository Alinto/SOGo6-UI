import { syncAppBadge } from '../badge/app-badge'
import {
  SHARE_PENDING_DB_NAME,
  SHARE_SESSION_KEY,
} from '../share/pending-share'
import { deleteOfflineDb } from './offline-db'

/** Runtime SW caches that may hold authenticated HTML / RSC / env. */
export const RUNTIME_CACHE_NAMES = [
  'pages',
  'others',
  'env',
  'manifest',
] as const

function deleteIndexedDb(name: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return Promise.resolve()
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
    request.onblocked = () => resolve()
  })
}

export async function wipeRuntimeCaches(): Promise<void> {
  if (typeof caches === 'undefined') return
  try {
    const keys = await caches.keys()
    await Promise.all(
      keys
        .filter((key) =>
          RUNTIME_CACHE_NAMES.some(
            (name) => key === name || key.startsWith(`${name}-`)
          )
        )
        .map((key) => caches.delete(key))
    )
  } catch {
    // Cache Storage may be unavailable (private mode / tests).
  }
}

export async function wipePendingShare(): Promise<void> {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(SHARE_SESSION_KEY)
    } catch {
      // ignore
    }
  }
  await deleteIndexedDb(SHARE_PENDING_DB_NAME)
}

/**
 * Wipe all offline IndexedDB data for a user (logout).
 */
export async function wipeOfflineUserData(userId: string): Promise<void> {
  if (!userId) return
  await deleteOfflineDb(userId)
  await wipePendingShare()
  await wipeRuntimeCaches()
  await syncAppBadge(null)
}
