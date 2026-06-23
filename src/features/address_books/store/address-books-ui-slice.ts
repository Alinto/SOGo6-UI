import type { ContactSortField } from '../address-books-api-types'
import type { ContactMember, VCard } from '../address-books-types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ContactSortOrder = 'asc' | 'desc'

export const DEFAULT_BOOK_PAGE_SIZE = 50

export interface AddressBooksUiState {
  isFormOpen: boolean
  editingContactId: string | null
  formBookId: string | null
  prefillContact: Partial<VCard> | null
  isListFormOpen: boolean
  editingListId: string | null
  prefillListMembers: ContactMember[] | null
  searchQuery: string
  sortOrder: ContactSortOrder
  sortBy: ContactSortField
  page: number
  pageSize: number
}

const initialState: AddressBooksUiState = {
  isFormOpen: false,
  editingContactId: null,
  formBookId: null,
  prefillContact: null,
  isListFormOpen: false,
  editingListId: null,
  prefillListMembers: null,
  searchQuery: '',
  sortOrder: 'asc',
  sortBy: 'display_name',
  page: 1,
  pageSize: DEFAULT_BOOK_PAGE_SIZE,
}

const addressBooksUiSlice = createSlice({
  name: 'addressBooksUi',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.page = 1
    },
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
      state.page = 1
    },
    setSortBy: (state, action: PayloadAction<ContactSortField>) => {
      state.sortBy = action.payload
      state.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = Math.max(1, action.payload)
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload
      state.page = 1
    },
    openCreateForm: (
      state,
      action: PayloadAction<{ bookId?: string; prefill?: Partial<VCard> } | undefined>
    ) => {
      state.isFormOpen = true
      state.editingContactId = null
      state.prefillContact = action.payload?.prefill ?? null
      if (action.payload?.bookId) {
        state.formBookId = action.payload.bookId
      }
    },
    openEditForm: (
      state,
      action: PayloadAction<{ contactId: string; bookId: string }>
    ) => {
      state.isFormOpen = true
      state.editingContactId = action.payload.contactId
      state.formBookId = action.payload.bookId
      state.prefillContact = null
    },
    closeForm: (state) => {
      state.isFormOpen = false
      state.editingContactId = null
      state.prefillContact = null
    },
    setFormBookId: (state, action: PayloadAction<string | null>) => {
      state.formBookId = action.payload
    },
    openCreateListForm: (
      state,
      action: PayloadAction<
        { bookId?: string; members?: ContactMember[] } | undefined
      >
    ) => {
      state.isListFormOpen = true
      state.editingListId = null
      state.prefillListMembers = action.payload?.members ?? null
      if (action.payload?.bookId) {
        state.formBookId = action.payload.bookId
      }
    },
    openEditListForm: (
      state,
      action: PayloadAction<{ listId: string; bookId: string }>
    ) => {
      state.isListFormOpen = true
      state.editingListId = action.payload.listId
      state.formBookId = action.payload.bookId
      state.prefillListMembers = null
    },
    closeListForm: (state) => {
      state.isListFormOpen = false
      state.editingListId = null
      state.prefillListMembers = null
    },
  },
})

export const {
  setSearchQuery,
  toggleSortOrder,
  setSortBy,
  setPage,
  setPageSize,
  openCreateForm,
  openEditForm,
  closeForm,
  setFormBookId,
  openCreateListForm,
  openEditListForm,
  closeListForm,
} = addressBooksUiSlice.actions

export const selectAddressBooksUi = (state: {
  addressBooksUi: AddressBooksUiState
}) => state.addressBooksUi

export default addressBooksUiSlice.reducer
