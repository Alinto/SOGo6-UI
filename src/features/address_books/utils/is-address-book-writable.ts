import type { AddressBook } from '../address-books-types'

export function isAddressBookWritable(book?: AddressBook | null): boolean {
  return book?.type === 'personal'
}

export function isAddressBookWritableByType(
  type?: AddressBook['type']
): boolean {
  return type === 'personal'
}
