import { syncAppBadge } from '../badge/app-badge'
import {
  SHARE_PENDING_DB_NAME,
  SHARE_SESSION_KEY,
} from '../share/pending-share'
import { deleteOfflineDb } from './offline-db'

/**
 * Runtime SW caches (see `SW_RUNTIME_CACHES` in sw-runtime.ts) that may hold
 * per-deployment data; `pages` is the legacy login-HTML cache.
 */
export const RUNTIME_CACHE_NAMES = ['pages', 'env', 'manifest'] as const

/** How long a blocked deletion may hold logout/login before we move on. */
export const DELETE_BLOCKED_TIMEOUT_MS = 3000

export type DeleteIndexedDbResult = 'deleted' | 'blocked' | 'error'

/**
 * Delete one IndexedDB database. `blocked` means another connection (often
 * another tab) still holds it open: the browser keeps the request queued and
 * deletes the database as soon as that connection closes, so we keep waiting
 * for `success` and only give up waiting after a timeout.
 */
export function deleteIndexedDb(
  name: string,
  blockedTimeoutMs = DELETE_BLOCKED_TIMEOUT_MS
): Promise<DeleteIndexedDbResult> {
  if (typeof indexedDB === 'undefined') return Promise.resolve('deleted')
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout> | null = null
    const done = (result: DeleteIndexedDbResult) => {
      if (timer) clearTimeout(timer)
      timer = null
      resolve(result)
    }
    let request: IDBOpenDBRequest
    try {
      request = indexedDB.deleteDatabase(name)
    } catch {
      done('error')
      return
    }
    request.onsuccess = () => done('deleted')
    request.onerror = () => done('error')
    request.onblocked = () => {
      if (timer) return
      timer = setTimeout(() => {
        console.warn(`[offline] deletion of ${name} still blocked`)
        done('blocked')
      }, blockedTimeoutMs)
    }
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
 * Per-user sessionStorage key that outlives the auth key on logout:
 * reminder-poller's list of calendar reminders already shown (event keys).
 * `sogo-env-vars` (env-service) is server config shared by every user (served
 * by the public /env route), so it is left alone.
 */
const REMINDER_NOTIFIED_SESSION_KEY = 'sogo.reminder.notified'

export function wipeUserSessionStorage(): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(REMINDER_NOTIFIED_SESSION_KEY)
    } catch {
      // ignore
    }
  }
}

/**
 * Wipe all offline IndexedDB data for a user (logout).
 */
export async function wipeOfflineUserData(userId: string): Promise<void> {
  if (!userId) return
  await deleteOfflineDb(userId)
  await wipePendingShare()
  wipeUserSessionStorage()
  await wipeRuntimeCaches()
  await syncAppBadge(null)
}

export const OFFLINE_DB_PREFIX = 'sogo-offline-'
const ACTIVE_OWNER_LOCK_PREFIX = 'sogo-offline-active:'

/**
 * Mark `userId` as signed in in this tab (Web Lock held until released), so
 * another tab signed in with another account does not delete its data.
 * No-op where the Web Locks API is unavailable.
 */
export function holdActiveOwnerLock(userId: string): () => void {
  if (typeof navigator === 'undefined' || !navigator.locks?.request) {
    return () => undefined
  }
  const controller = new AbortController()
  let release: () => void = () => undefined
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  navigator.locks
    .request(
      `${ACTIVE_OWNER_LOCK_PREFIX}${userId}`,
      { mode: 'shared', signal: controller.signal },
      () => held
    )
    .catch(() => undefined)
  return () => {
    controller.abort()
    release()
  }
}

async function activeOwnersElsewhere(): Promise<Set<string>> {
  const owners = new Set<string>()
  if (typeof navigator === 'undefined' || !navigator.locks?.query) {
    return owners
  }
  try {
    const { held = [] } = await navigator.locks.query()
    for (const lock of held) {
      if (lock.name?.startsWith(ACTIVE_OWNER_LOCK_PREFIX)) {
        owners.add(lock.name.slice(ACTIVE_OWNER_LOCK_PREFIX.length))
      }
    }
  } catch {
    // Unknown: treat nobody as active.
  }
  return owners
}

/**
 * Delete the offline databases of every account other than `currentUserId`
 * (a shared device where the previous user never logged out). This also
 * drops that user's unsent Outbox and local drafts: on this product, data of
 * an account that is not signed in must not stay on the device. Accounts
 * still signed in in another tab (see holdActiveOwnerLock) are spared.
 * No-op where `indexedDB.databases()` is unavailable (older Firefox/Safari).
 */
export async function wipeOtherUsersOfflineData(
  currentUserId: string
): Promise<string[]> {
  if (!currentUserId || typeof indexedDB === 'undefined') return []
  if (typeof indexedDB.databases !== 'function') return []
  let names: string[]
  try {
    const databases = await indexedDB.databases()
    const active = await activeOwnersElsewhere()
    names = databases
      .map((db) => db.name ?? '')
      .filter(
        (name) =>
          name.startsWith(OFFLINE_DB_PREFIX) &&
          name !== `${OFFLINE_DB_PREFIX}${currentUserId}` &&
          !active.has(name.slice(OFFLINE_DB_PREFIX.length))
      )
  } catch {
    return []
  }
  await Promise.all(names.map((name) => deleteIndexedDb(name)))
  return names
}
