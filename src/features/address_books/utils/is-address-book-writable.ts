import type { AddressBook } from '../address-books-types'
import {
  getAddressBookPermissions,
  hasAnyWritePermission,
} from './address-book-permissions'

/** True when the user holds at least one write right (create / edit / erase). */
export function isAddressBookWritable(book?: AddressBook | null): boolean {
  return hasAnyWritePermission(getAddressBookPermissions(book))
}

export function isAddressBookWritableByType(
  type?: AddressBook['type']
): boolean {
  return type === 'personal'
}
