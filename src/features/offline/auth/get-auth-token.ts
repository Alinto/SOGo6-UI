const STORAGE_KEY = 'sogo_auth'

export interface StoredAuth {
  token: string
  user: { uid: string; cn: string; email: string }
  rememberMe: boolean
}

/**
 * Read auth from localStorage/sessionStorage (same key as Redux sync middleware).
 * Used by outbox flush — do not duplicate JWT into IndexedDB.
 */
export function readStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuth
    if (!parsed?.token || !parsed?.user?.uid) return null
    return parsed
  } catch {
    return null
  }
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
