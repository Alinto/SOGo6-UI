import { syncAppBadge } from '../badge/app-badge'
import { deleteOfflineDb } from './offline-db'

/**
 * Wipe all offline IndexedDB data for a user (logout).
 */
export async function wipeOfflineUserData(userId: string): Promise<void> {
  if (!userId) return
  await deleteOfflineDb(userId)
  await syncAppBadge(null)
}
