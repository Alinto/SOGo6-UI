import { logout } from '@/features/auth/components/store/auth.slice'
import { installCrossTabAuthSync } from '@/features/offline/auth/cross-tab-auth-sync'
import {
  AUTH_STORAGE_KEY,
  parseStoredAuth,
  registerCurrentAuth,
} from '@/features/offline/auth/get-auth-token'
import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'

const STORAGE_KEY = AUTH_STORAGE_KEY

/**
 * On logout, localStorage is shared by every tab: only clear it when it still
 * holds the account this tab is logging out. Clearing another tab's account
 * would log that tab out too (cross-tab sync).
 */
function removePersistedAuth(loggedOutUid: string | null | undefined) {
  sessionStorage.removeItem(STORAGE_KEY)
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === null) return
  const storedUid = parseStoredAuth(stored)?.user.uid
  if (!storedUid || !loggedOutUid || storedUid === loggedOutUid) {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * Middleware that automatically saves the auth state to localStorage
 * every time an auth/ action is dispatched. It also mirrors this tab's
 * session in memory for the offline layer (cache owner, outbox token) and
 * logs this tab out when another tab logs out or switches account.
 */
export const localStorageSyncMiddleware: Middleware<object, RootState> = (
  store
) => {
  if (typeof window !== 'undefined') {
    registerCurrentAuth(store.getState()?.auth)
    installCrossTabAuthSync({
      getCurrentUid: () => store.getState()?.auth?.user?.uid,
      onForeignChange: () => {
        store.dispatch(logout())
      },
    })
  }

  return (next) => (action) => {
    const actionType = (action as { type?: string }).type
    const isAuthAction = actionType?.startsWith('auth/') ?? false
    const previousUid = isAuthAction
      ? store.getState()?.auth?.user?.uid
      : undefined

    const result = next(action)

    // Save only after auth actions
    if (isAuthAction) {
      const { auth } = store.getState()
      if (typeof window !== 'undefined') registerCurrentAuth(auth)
      try {
        if (auth.token) {
          const payload = JSON.stringify({
            token: auth.token,
            user: auth.user,
            rememberMe: auth.rememberMe,
          })
          if (auth.rememberMe) {
            localStorage.setItem(STORAGE_KEY, payload)
            sessionStorage.removeItem(STORAGE_KEY)
          } else {
            sessionStorage.setItem(STORAGE_KEY, payload)
            localStorage.removeItem(STORAGE_KEY)
          }
        } else {
          removePersistedAuth(previousUid)
        }
      } catch (error) {
        console.error('Error saving auth to localStorage:', error)
      }
    }

    return result
  }
}

interface StoredAuthState {
  token: string
  user: {
    uid: string
    cn: string
    email: string
  }
  rememberMe: boolean
}

/**
 * Loads the auth state from localStorage or sessionStorage on startup.
 * Checks localStorage first (rememberMe), then sessionStorage.
 */
export const loadAuthFromStorage = (): StoredAuthState | undefined => {
  if (typeof window === 'undefined') return undefined

  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined

    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed.token === 'string' &&
      parsed.user &&
      typeof parsed.user.uid === 'string'
    ) {
      return {
        token: parsed.token,
        user: parsed.user,
        rememberMe: parsed.rememberMe ?? false,
      }
    }
    return undefined
  } catch (error) {
    console.error('Error loading auth from storage:', error)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return undefined
  }
}
