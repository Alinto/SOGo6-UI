import { createSlice } from '@reduxjs/toolkit'
import type { UserPreferences } from './user-preferences-api-types'

interface UserPreferencesState {
  data: UserPreferences
}

const initialState: UserPreferencesState = {
  data: {} as UserPreferences,
}

const userPreferencesSlice = createSlice({
  name: 'UserPreferences',
  initialState,
  reducers: {},
})

export default userPreferencesSlice.reducer
