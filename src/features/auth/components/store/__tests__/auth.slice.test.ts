import '@testing-library/jest-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  clearMfaPending,
  logout,
  selectIsAuthenticated,
  selectMfaPending,
  setCredentials,
  setMfaPending,
} from '../auth.slice'
import type { MfaPending } from '../auth.slice'
import type { User } from '../auth.slice'

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

    store.dispatch(setCredentials({ token: 'test-token', user, rememberMe: false }))

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

    store.dispatch(setCredentials({ token: 'test-token', user, rememberMe: false }))
    store.dispatch(logout())

    const state = store.getState().auth
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(selectIsAuthenticated(store.getState())).toBe(false)
  })

  describe('MFA pending login', () => {
    const pending: MfaPending = {
      token: 'mfa-token',
      stage: 'verify',
      provider: 'totp',
      allowedMethods: [],
      email: 'test@example.com',
      rememberMe: true,
    }
    const user: User = { uid: '1', cn: 'Test', email: 'test@example.com' }
    const makeStore = () => configureStore({ reducer: { auth: authReducer } })

    it('stores the MFA token without authenticating the user', () => {
      const store = makeStore()
      store.dispatch(setMfaPending(pending))
      expect(selectMfaPending(store.getState())).toEqual(pending)
      expect(selectIsAuthenticated(store.getState())).toBe(false)
    })

    it('drops the MFA token on clearMfaPending, setCredentials and logout', () => {
      const store = makeStore()
      store.dispatch(setMfaPending(pending))
      store.dispatch(clearMfaPending())
      expect(selectMfaPending(store.getState())).toBeNull()

      store.dispatch(setMfaPending(pending))
      store.dispatch(setCredentials({ token: 't', user, rememberMe: true }))
      expect(selectMfaPending(store.getState())).toBeNull()

      store.dispatch(setMfaPending(pending))
      store.dispatch(logout())
      expect(selectMfaPending(store.getState())).toBeNull()
    })
  })
})
