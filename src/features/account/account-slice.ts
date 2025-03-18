import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Account } from './account-types'

const initialState: Account = {
  id: '',
  username: '',
}

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccount(state, action: PayloadAction<Account>) {
      state.id = action.payload.id
      state.username = action.payload.username
    },
  },
})

export const { setAccount } = accountSlice.actions
export default accountSlice.reducer
