import { wipeOfflineUserData } from '../db/wipe'

/** One wipe per user: a second logout for the same uid reuses the running one. */
const pendingByUser = new Map<string, Promise<void>>()

/**
 * Delete the offline data of `userId` (IndexedDB, pending share, SW caches).
 * Started by the logout listener so every logout path (button, 401, mail
 * errors) cleans up, not only the header button.
 */
export function startLogoutWipe(
  userId: string | null | undefined
): Promise<void> {
  if (!userId) return waitForLogoutWipe()
  const running = pendingByUser.get(userId)
  if (running) return running

  const wipe = wipeOfflineUserData(userId)
    .catch(() => undefined)
    .finally(() => {
      pendingByUser.delete(userId)
    })
  pendingByUser.set(userId, wipe)
  return wipe
}

/**
 * Resolve once every wipe started by a logout is done. Redirects and the next
 * login wait on it so a deletion never races a freshly opened database.
 */
export function waitForLogoutWipe(): Promise<void> {
  if (pendingByUser.size === 0) return Promise.resolve()
  return Promise.all(pendingByUser.values()).then(() => undefined)
}
