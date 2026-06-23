'use client'

import { skipToken } from '@reduxjs/toolkit/query'
import { useGetAddressBookContactPickerQuery } from '../store/address-books-api'

export function useAddressBookContactPicker(bookId: string | null | undefined) {
  const { data: contacts = [], isLoading, isFetching } =
    useGetAddressBookContactPickerQuery(bookId ?? skipToken)

  return {
    contacts,
    isLoading,
    isFetching,
  }
}
