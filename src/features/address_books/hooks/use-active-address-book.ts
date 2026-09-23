'use client'

import { useAppSelector } from '@/lib/redux/hooks'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import type { AddressBook } from '../address-books-types'
import { useGetAddressBooksQuery } from '../store/address-books-api'
import { selectBookRights } from '../store/address-books-ui-slice'
import {
  getAddressBookPermissions,
  hasAnyWritePermission,
  NO_WRITE_PERMISSIONS,
} from '../utils/address-book-permissions'

function findAddressBook(
  books:
    | {
        personals: AddressBook[]
        subscriptions: AddressBook[]
        globals: AddressBook[]
      }
    | undefined,
  bookId?: string | null
): AddressBook | null {
  if (!books || !bookId) return null
  const all = [...books.personals, ...books.subscriptions, ...books.globals]
  return all.find((book) => book.id === bookId) ?? null
}

export function useActiveAddressBook() {
  const params = useParams() ?? {}
  const bookId = typeof params.book_id === 'string' ? params.book_id : null
  const { data } = useGetAddressBooksQuery()

  return useMemo(() => findAddressBook(data, bookId), [bookId, data])
}

export function useActiveAddressBookWritable() {
  const params = useParams() ?? {}
  const bookId = typeof params.book_id === 'string' ? params.book_id : null
  const activeBook = useActiveAddressBook()
  const rights = useAppSelector((state) => selectBookRights(state, bookId))

  if (bookId === ALL_CONTACTS_BOOK_ID) {
    return {
      writable: false,
      permissions: NO_WRITE_PERMISSIONS,
      book: null,
      bookId,
    }
  }

  const permissions = getAddressBookPermissions(activeBook, rights)
  return {
    writable: hasAnyWritePermission(permissions),
    permissions,
    book: activeBook,
    bookId,
  }
}
