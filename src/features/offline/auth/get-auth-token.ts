export const AUTH_STORAGE_KEY = 'sogo_auth'

export interface StoredAuth {
  token: string
  user: { uid: string; cn: string; email: string }
  rememberMe: boolean
}

interface AuthStateLike {
  token: string | null
  user: { uid: string; cn: string; email: string } | null
  rememberMe?: boolean
}

/**
 * Session of THIS tab, mirrored from the Redux auth state (see the
 * local-storage-sync middleware). Storage is shared by every tab of the
 * origin: another tab may already hold another account there, so the offline
 * owner and the outbox token must come from memory once a store exists.
 */
let currentAuth: StoredAuth | null = null
let currentAuthRegistered = false

export function registerCurrentAuth(auth: AuthStateLike | null | undefined) {
  currentAuthRegistered = true
  currentAuth =
    auth?.token && auth.user?.uid
      ? {
          token: auth.token,
          user: auth.user,
          rememberMe: auth.rememberMe ?? false,
        }
      : null
}

/** Test helper: forget the in-memory session (storage fallback again). */
export function resetCurrentAuthForTests() {
  currentAuth = null
  currentAuthRegistered = false
}

export function parseStoredAuth(raw: string | null): StoredAuth | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredAuth
    if (!parsed?.token || !parsed?.user?.uid) return null
    return parsed
  } catch {
    return null
  }
}

/** Raw read of the persisted session (localStorage, then sessionStorage). */
export function readPersistedAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null
  try {
    return parseStoredAuth(
      localStorage.getItem(AUTH_STORAGE_KEY) ??
        sessionStorage.getItem(AUTH_STORAGE_KEY)
    )
  } catch {
    return null
  }
}

/**
 * Session of the current tab: the in-memory Redux auth once the store has
 * registered it (null after a logout, even if storage holds another
 * account), the persisted one otherwise. Token and uid always come from the
 * same session, so the outbox never flushes one account with another token.
 * Do not duplicate the JWT into IndexedDB.
 */
export function readStoredAuth(): StoredAuth | null {
  if (currentAuthRegistered) return currentAuth
  return readPersistedAuth()
}

export function getAuthUserId(): string | null {
  return readStoredAuth()?.user.uid ?? null
}

export function getAuthToken(): string | null {
  return readStoredAuth()?.token ?? null
}

/** Best-effort JWT expiry check (no signature verification). */
export function isJwtExpired(token: string, skewMs = 30_000): boolean {
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) return true
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as { exp?: number }
    if (!payload.exp) return false
    return payload.exp * 1000 <= Date.now() + skewMs
  } catch {
    return true
  }
}
