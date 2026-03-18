import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  uid: string
  cn: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  rememberMe: boolean
}

const initialState: AuthState = {
  token: null,
  user: null,
  rememberMe: false,
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
    },
    // On logout, the localStorage-sync middleware clears both localStorage and sessionStorage
    logout: (state) => {
      state.token = null
      state.user = null
      state.rememberMe = false
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

// Selector to derive authentication status from token
export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  state.auth.token !== null

export default authSlice.reducer
