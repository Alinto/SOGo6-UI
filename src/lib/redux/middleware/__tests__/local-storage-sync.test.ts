import '@testing-library/jest-dom'
import {
  localStorageSyncMiddleware,
  loadAuthFromStorage,
} from '../local-storage-sync'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { setCredentials, logout } from '@/features/auth/components/store/auth.slice'
import type { User } from '@/features/auth/components/store/auth.slice'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Local Storage Sync Middleware', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should export middleware and loadAuthFromStorage function without crashing', () => {
    expect(localStorageSyncMiddleware).toBeDefined()
    expect(loadAuthFromStorage).toBeDefined()
  })

  it('should create store with middleware', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(localStorageSyncMiddleware),
    })

    expect(store).toBeDefined()
  })

  it('should save auth state to localStorage on setCredentials', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(localStorageSyncMiddleware),
    })

    const user: User = {
      uid: '123',
      cn: 'Test User',
      email: 'test@example.com',
    }

    store.dispatch(setCredentials({ token: 'test-token', user }))

    const saved = localStorageMock.getItem('sogo_auth')
    expect(saved).toBeTruthy()
    if (saved) {
      const parsed = JSON.parse(saved)
      expect(parsed.token).toBe('test-token')
      expect(parsed.isAuthenticated).toBe(true)
    }
  })

  it('should remove auth state from localStorage on logout', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(localStorageSyncMiddleware),
    })

    const user: User = {
      uid: '123',
      cn: 'Test User',
      email: 'test@example.com',
    }

    store.dispatch(setCredentials({ token: 'test-token', user }))
    store.dispatch(logout())

    const saved = localStorageMock.getItem('sogo_auth')
    expect(saved).toBeNull()
  })

  it('should load auth state from localStorage', () => {
    const user: User = {
      uid: '123',
      cn: 'Test User',
      email: 'test@example.com',
    }

    localStorageMock.setItem(
      'sogo_auth',
      JSON.stringify({
        token: 'test-token',
        user,
        isAuthenticated: true,
      })
    )

    const loaded = loadAuthFromStorage()
    expect(loaded).toBeDefined()
    if (loaded) {
      expect(loaded.token).toBe('test-token')
      expect(loaded.isAuthenticated).toBe(true)
    }
  })

  it('should return undefined if no auth state in localStorage', () => {
    const loaded = loadAuthFromStorage()
    expect(loaded).toBeUndefined()
  })
})
