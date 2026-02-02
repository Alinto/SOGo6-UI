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
        if (auth.isAuthenticated) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              token: auth.token,
              user: auth.user,
              isAuthenticated: auth.isAuthenticated,
            })
          )
        } else {
          // Remove if logged out
          localStorage.removeItem(STORAGE_KEY)
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
  isAuthenticated: boolean
}

/**
 * Loads the auth state from localStorage on startup
 * @returns The saved auth state or undefined if nothing is found
 */
export const loadAuthFromStorage = (): StoredAuthState | undefined => {
  // Prevent execution on server side
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return undefined

    const parsed = JSON.parse(saved)

    // Basic structure validation
    if (
      parsed &&
      typeof parsed.token === 'string' &&
      parsed.user &&
      typeof parsed.isAuthenticated === 'boolean'
    ) {
      return parsed as StoredAuthState
    }

    return undefined
  } catch (error) {
    console.error('Error loading auth from localStorage:', error)
    localStorage.removeItem(STORAGE_KEY) // Clean corrupted data
    return undefined
  }
}
