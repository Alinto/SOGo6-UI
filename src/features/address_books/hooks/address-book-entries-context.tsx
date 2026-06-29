'use client'

import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import { useAddressBookEntries } from './use-address-book-entries'
import { useAllContactsEntries } from './use-all-contacts-entries'
import React, { createContext, useContext } from 'react'

type AddressBookEntriesValue = ReturnType<typeof useAddressBookEntries>

const AddressBookEntriesContext = createContext<AddressBookEntriesValue | null>(
  null
)

export function AddressBookEntriesProvider({
  bookId,
  children,
}: {
  bookId: string | null
  children: React.ReactNode
}) {
  const isAllContactsView = bookId === ALL_CONTACTS_BOOK_ID
  const bookEntries = useAddressBookEntries(isAllContactsView ? null : bookId)
  const allContactsEntries = useAllContactsEntries(isAllContactsView)
  const value = isAllContactsView ? allContactsEntries : bookEntries

  return (
    <AddressBookEntriesContext.Provider value={value}>
      {children}
    </AddressBookEntriesContext.Provider>
  )
}

export function useAddressBookEntriesContext(): AddressBookEntriesValue {
  const context = useContext(AddressBookEntriesContext)
  if (!context) {
    throw new Error(
      'useAddressBookEntriesContext must be used within AddressBookEntriesProvider'
    )
  }
  return context
}
