import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  uid: string
  cn: string
  email: string
}

/**
 * Second login step in progress: the password was valid, the backend returned
 * an MFA token (not a user session). Kept in memory only, never persisted.
 */
export interface MfaPending {
  token: string
  stage: 'verify' | 'enroll'
  provider: string | null
  allowedMethods: string[]
  email: string
  rememberMe: boolean
}

interface AuthState {
  token: string | null
  user: User | null
  rememberMe: boolean
  mfaPending?: MfaPending | null
}

const initialState: AuthState = {
  token: null,
  user: null,
  rememberMe: false,
  mfaPending: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User; rememberMe: boolean }>
    ) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.rememberMe = action.payload.rememberMe
      state.mfaPending = null
    },
    setMfaPending: (state, action: PayloadAction<MfaPending>) => {
      state.mfaPending = action.payload
    },
    clearMfaPending: (state) => {
      state.mfaPending = null
    },
    // On logout, the localStorage-sync middleware clears both localStorage and sessionStorage
    logout: (state) => {
      state.token = null
      state.user = null
      state.rememberMe = false
      state.mfaPending = null
    },
  },
})

export const { setCredentials, setMfaPending, clearMfaPending, logout } =
  authSlice.actions

// Selector to derive authentication status from token
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.token !== null

export const selectMfaPending = (state: {
  auth: { mfaPending?: MfaPending | null }
}) => state.auth.mfaPending ?? null

export default authSlice.reducer
