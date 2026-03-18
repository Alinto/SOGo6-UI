import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'

const STORAGE_KEY = 'sogo_auth'

/**
 * Middleware that automatically saves the auth state to localStorage
 * every time an auth/ action is dispatched
 */
export const localStorageSyncMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const result = next(action)

    // Save only after auth actions
    const actionType = (action as { type?: string }).type
    if (actionType?.startsWith('auth/')) {
      const { auth } = store.getState()
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
          localStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(STORAGE_KEY)
        }
      } catch (error) {
        console.error('Error saving auth to localStorage:', error)
      }
    }

    return result
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
