import '@testing-library/jest-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { setCredentials, logout, selectIsAuthenticated } from '../auth.slice'
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
})
