import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import type {
  AddressBook,
  AddressBookShareRights,
  AddressBooks,
} from '../address-books-types'
import { getAddressBookPermissions } from './address-book-permissions'

export function listCreatableAddressBooks(
  books: AddressBooks | undefined,
  rightsByBook: Record<string, AddressBookShareRights> = {}
): AddressBook[] {
  if (!books) return []

  return [...books.personals, ...books.subscriptions, ...books.globals].filter(
    (book) => {
      if (book.id === ALL_CONTACTS_BOOK_ID) return false
      return getAddressBookPermissions(book, rightsByBook[book.id]).canCreate
    }
  )
}
