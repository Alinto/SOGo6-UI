import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { MailSearchParams } from '../mails-types'

interface MailSearchState {
  isActive: boolean
  accountId: string | null
  params: MailSearchParams | null
  // The folder that was open (route `[folder]` param) when the search was
  // triggered. Kept in Redux — rather than component-local state — so that
  // leaving the results view on folder navigation still works even though
  // the components reading it (page-level, not layout-level) get freshly
  // remounted by Next.js on every navigation. See useFolderMessages.
  folder: string | null
}

const initialState: MailSearchState = {
  isActive: false,
  accountId: null,
  params: null,
  folder: null,
}

const mailSearchSlice = createSlice({
  name: 'mailSearch',
  initialState,
  reducers: {
    setMailSearch(
      state,
      action: PayloadAction<{
        accountId: string
        params: MailSearchParams
        folder: string
      }>
    ) {
      state.isActive = true
      state.accountId = action.payload.accountId
      state.params = action.payload.params
      state.folder = action.payload.folder
    },
    clearMailSearch(state) {
      state.isActive = false
      state.accountId = null
      state.params = null
      state.folder = null
    },
  },
})

export const { setMailSearch, clearMailSearch } = mailSearchSlice.actions
export default mailSearchSlice.reducer
