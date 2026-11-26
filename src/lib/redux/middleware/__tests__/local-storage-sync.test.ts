import type { User } from '@/features/auth/components/store/auth.slice'
import authReducer, {
  logout,
  selectIsAuthenticated,
  setCredentials,
} from '@/features/auth/components/store/auth.slice'
import * as tokenModule from '@/features/offline/auth/get-auth-token'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { localStorageSyncMiddleware } from '../local-storage-sync'

describe('Auth Slice', () => {
  it('should export reducer and actions without crashing', () => {
    expect(authReducer).toBeDefined()
    expect(setCredentials).toBeDefined()
    expect(logout).toBeDefined()
  })

  it('should create store with auth reducer', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })

    expect(store.getState().auth).toBeDefined()
    expect(selectIsAuthenticated(store.getState())).toBe(false)
  })

  it('should handle setCredentials action', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })

    const user: User = {
      uid: '123',
      cn: 'Test User',
      email: 'test@example.com',
    }

    store.dispatch(
      setCredentials({ token: 'test-token', user, rememberMe: false })
    )

    const state = store.getState().auth
    expect(state.token).toBe('test-token')
    expect(state.user).toEqual(user)
    expect(selectIsAuthenticated(store.getState())).toBe(true)
  })

  it('should handle logout action', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })

    const user: User = {
      uid: '123',
      cn: 'Test User',
      email: 'test@example.com',
    }

    store.dispatch(
      setCredentials({ token: 'test-token', user, rememberMe: false })
    )
    store.dispatch(logout())

    const state = store.getState().auth
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(selectIsAuthenticated(store.getState())).toBe(false)
  })
})

describe('localStorageSyncMiddleware', () => {
  const alice: User = { uid: 'alice', cn: 'Alice', email: 'a@x.y' }
  const stored = (uid: string) =>
    JSON.stringify({
      token: `tok-${uid}`,
      user: { uid, cn: uid, email: `${uid}@x.y` },
      rememberMe: true,
    })

  function makeStore() {
    return configureStore({
      reducer: { auth: authReducer },
      middleware: (getDefault) =>
        getDefault().concat(localStorageSyncMiddleware),
    })
  }

  afterEach(() => {
    tokenModule.resetCurrentAuthForTests()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('mirrors this tab session in memory for the offline layer', () => {
    const store = makeStore()
    store.dispatch(
      setCredentials({ token: 'tok-alice', user: alice, rememberMe: true })
    )
    localStorage.setItem('sogo_auth', stored('bob'))
    expect(tokenModule.getAuthUserId()).toBe('alice')
    expect(tokenModule.getAuthToken()).toBe('tok-alice')
    store.dispatch(logout())
    expect(tokenModule.getAuthUserId()).toBeNull()
  })

  it('does not clear another account persisted by another tab on logout', () => {
    const store = makeStore()
    store.dispatch(
      setCredentials({ token: 'tok-alice', user: alice, rememberMe: false })
    )
    localStorage.setItem('sogo_auth', stored('bob'))
    store.dispatch(logout())
    expect(sessionStorage.getItem('sogo_auth')).toBeNull()
    expect(localStorage.getItem('sogo_auth')).toBe(stored('bob'))
  })

  it('clears its own persisted account on logout', () => {
    const store = makeStore()
    store.dispatch(
      setCredentials({ token: 'tok-alice', user: alice, rememberMe: true })
    )
    store.dispatch(logout())
    expect(localStorage.getItem('sogo_auth')).toBeNull()
  })

  it('logs this tab out when another tab logs in another account', () => {
    const store = makeStore()
    store.dispatch(
      setCredentials({ token: 'tok-alice', user: alice, rememberMe: true })
    )
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'sogo_auth',
        oldValue: null,
        newValue: stored('bob'),
        storageArea: localStorage,
      })
    )
    expect(store.getState().auth.token).toBeNull()
    expect(tokenModule.getAuthUserId()).toBeNull()
  })
})
