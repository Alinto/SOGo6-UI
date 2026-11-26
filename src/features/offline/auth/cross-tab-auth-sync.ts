import { AUTH_STORAGE_KEY, parseStoredAuth } from './get-auth-token'

interface CrossTabAuthSyncOptions {
  /** uid of the account this tab holds in memory (null when logged out). */
  getCurrentUid: () => string | null | undefined
  /** Called when another tab removed or replaced this tab's account. */
  onForeignChange: () => void
}

/**
 * Decide whether a `storage` event on the auth key ends this tab's session.
 * `storage` events only fire for localStorage (shared across tabs).
 */
export function isForeignAuthChange(
  currentUid: string | null | undefined,
  oldValue: string | null,
  newValue: string | null
): boolean {
  if (!currentUid) return false
  if (newValue !== null) {
    // Another tab logged in: a different account now owns the device.
    const next = parseStoredAuth(newValue)
    return next?.user.uid !== currentUid
  }
  // Removed: another tab logged out. Only follow it when it was this account
  // (a session-only tab of another user keeps its own session).
  const previous = parseStoredAuth(oldValue)
  return !previous || previous.user.uid === currentUid
}

let uninstallCurrent: (() => void) | null = null

/**
 * Log this tab out when another tab logs out or logs in another account, so
 * it stops fetching and caching the previous account's data. One listener
 * per page: installing again replaces the previous one (new store).
 */
export function installCrossTabAuthSync({
  getCurrentUid,
  onForeignChange,
}: CrossTabAuthSyncOptions): () => void {
  uninstallCurrent?.()
  if (typeof window === 'undefined') {
    uninstallCurrent = null
    return () => undefined
  }
  const onStorage = (event: StorageEvent) => {
    // `key === null` is localStorage.clear().
    if (event.key !== AUTH_STORAGE_KEY && event.key !== null) return
    if (event.storageArea && event.storageArea !== window.localStorage) return
    const oldValue = event.key === null ? null : event.oldValue
    const newValue = event.key === null ? null : event.newValue
    if (isForeignAuthChange(getCurrentUid(), oldValue, newValue)) {
      onForeignChange()
    }
  }
  window.addEventListener('storage', onStorage)
  const uninstall = () => {
    window.removeEventListener('storage', onStorage)
    if (uninstallCurrent === uninstall) uninstallCurrent = null
  }
  uninstallCurrent = uninstall
  return uninstall
}
