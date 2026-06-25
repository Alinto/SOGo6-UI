'use client'

import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import type { AddressBook } from '../address-books-types'
import { useGetAddressBooksQuery } from '../store/address-books-api'
import { isAddressBookWritable } from '../utils/is-address-book-writable'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

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

  if (bookId === ALL_CONTACTS_BOOK_ID) {
    return { writable: false, book: null, bookId }
  }

  return {
    writable: isAddressBookWritable(activeBook),
    book: activeBook,
    bookId,
  }
}
