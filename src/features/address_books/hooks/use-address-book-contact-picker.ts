'use client'

import { skipToken } from '@reduxjs/toolkit/query'
import { useGetAddressBookContactPickerQuery } from '../store/address-books-api'

export function useAddressBookContactPicker(
  bookId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false
  const queryArg =
    enabled && bookId ? bookId : skipToken

  const { data: contacts = [], isLoading, isFetching } =
    useGetAddressBookContactPickerQuery(queryArg)

  return {
    contacts,
    isLoading,
    isFetching,
  }
}
