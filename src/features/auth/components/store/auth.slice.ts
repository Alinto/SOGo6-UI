import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  uid: string
  cn: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
}

const initialState: AuthState = {
  token: null,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token
      state.user = action.payload.user
    },
    logout: (state) => {
      state.token = null
      state.user = null
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

// Selector to derive authentication status from token
export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  state.auth.token !== null

export default authSlice.reducer
