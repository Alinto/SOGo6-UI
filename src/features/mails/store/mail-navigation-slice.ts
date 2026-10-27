import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MailNavigationState {
  folderKey: string | null
  orderedIds: string[]
  /**
   * Actual folder for each ordered id, keyed by mail id. Search results can
   * span multiple folders, so a single `folderKey` isn't enough to build the
   * prev/next mail URL — see useFolderMessages.
   */
  folderById: Record<string, string>
  page: number
  totalPages: number
  skipFolderFetch: boolean
  /** True while a reload asked by the user (Refresh, folder change) is in flight. */
  isManualRefresh: boolean
}

const initialState: MailNavigationState = {
  folderKey: null,
  orderedIds: [],
  folderById: {},
  page: 1,
  totalPages: 1,
  skipFolderFetch: false,
  isManualRefresh: false,
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
        folderById?: Record<string, string>
        page: number
        totalPages: number
      }>
    ) => {
      state.folderKey = action.payload.folderKey
      state.orderedIds = action.payload.orderedIds
      state.folderById = action.payload.folderById ?? {}
      state.page = action.payload.page
      state.totalPages = action.payload.totalPages
    },
    clearMailNavigation: (state) => {
      state.folderKey = null
      state.orderedIds = []
      state.folderById = {}
      state.page = 1
      state.totalPages = 1
    },
    setSkipFolderFetch: (state, action: PayloadAction<boolean>) => {
      state.skipFolderFetch = action.payload
    },
    setManualRefresh: (state, action: PayloadAction<boolean>) => {
      state.isManualRefresh = action.payload
    },
  },
})

export const {
  setMailNavigation,
  clearMailNavigation,
  setSkipFolderFetch,
  setManualRefresh,
} = mailNavigationSlice.actions

export const selectSkipFolderFetch = (state: {
  mailNavigation: MailNavigationState
}) => state.mailNavigation.skipFolderFetch

/** `accountId/folder` of the last list shown (null before the first one). */
export const selectMailNavigationFolderKey = (state: {
  mailNavigation: MailNavigationState
}) => state.mailNavigation.folderKey

export const selectIsManualRefresh = (state: {
  mailNavigation: MailNavigationState
}) => state.mailNavigation.isManualRefresh

export default mailNavigationSlice.reducer
