import { createSlice } from '@reduxjs/toolkit'
import type { AddressBook } from '../address-books-types'

interface AddressBooksSettingsState {
  data: AddressBook[]
}

const initialState: AddressBooksSettingsState = {
  data: [],
}

const addressBooksSettingsSlice = createSlice({
  name: 'address_books_settings',
  initialState,
  reducers: {},
})

export default addressBooksSettingsSlice.reducer
