import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MailNavigationState {
  folderKey: string | null
  orderedIds: string[]
  page: number
  totalPages: number
  skipFolderFetch: boolean
}

const initialState: MailNavigationState = {
  folderKey: null,
  orderedIds: [],
  page: 1,
  totalPages: 1,
  skipFolderFetch: false,
}

const mailNavigationSlice = createSlice({
  name: 'mailNavigation',
  initialState,
  reducers: {
    setMailNavigation: (
      state,
      action: PayloadAction<{
        folderKey: string
        orderedIds: string[]
        page: number
        totalPages: number
      }>
    ) => {
      state.folderKey = action.payload.folderKey
      state.orderedIds = action.payload.orderedIds
      state.page = action.payload.page
      state.totalPages = action.payload.totalPages
    },
    clearMailNavigation: (state) => {
      state.folderKey = null
      state.orderedIds = []
      state.page = 1
      state.totalPages = 1
    },
    setSkipFolderFetch: (state, action: PayloadAction<boolean>) => {
      state.skipFolderFetch = action.payload
    },
  },
})

export const { setMailNavigation, clearMailNavigation, setSkipFolderFetch } =
  mailNavigationSlice.actions

export const selectSkipFolderFetch = (state: {
  mailNavigation: MailNavigationState
}) => state.mailNavigation.skipFolderFetch

export default mailNavigationSlice.reducer
