import type { AddressBook, AddressBooks } from '../address-books-types'

export function resolveDefaultBookId(
  personals: Pick<AddressBook, 'id' | 'default'>[]
): string | null {
  if (!personals.length) return null
  return personals.find((book) => book.default)?.id ?? personals[0].id
}

export function resolveDefaultAddressBookId(books: AddressBooks): string | null {
  const personalId = resolveDefaultBookId(books.personals)
  if (personalId) return personalId
  return books.subscriptions[0]?.id ?? books.globals[0]?.id ?? null
}
