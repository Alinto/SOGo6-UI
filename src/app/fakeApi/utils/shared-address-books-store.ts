import { getDemoData } from '@/app/fakeApi/utils/demo-storage'
import type {
  AddressBook,
  SharedAddressBook,
} from '@/features/address_books/address-books-types'
import type { NextRequest } from 'next/server'

/** Only the subscribed keys are stored, to keep the demo cookies small. */
export const SUBSCRIBED_ADDRESS_BOOKS_STORAGE_KEY =
  'demo_shared_address_book_subscriptions'

const FULL_RIGHTS = {
  can_view: true,
  can_create_objects: true,
  can_edit_objects: true,
  can_erase_objects: true,
}

const READ_RIGHTS = {
  can_view: true,
  can_create_objects: false,
  can_edit_objects: false,
  can_erase_objects: false,
}

const sharedAddressBook = (
  key: string,
  name: string,
  owner: string,
  nameOwner: string,
  rights: SharedAddressBook['rights'] = READ_RIGHTS
): SharedAddressBook => ({
  key,
  name,
  description: null,
  owner,
  name_owner: nameOwner,
  is_default: false,
  source_type: 'local',
  rights,
  subscribed: false,
})

/** Address books other users have shared with the fake connected account. */
export const SHARED_ADDRESS_BOOKS_CATALOG: SharedAddressBook[] = [
  sharedAddressBook(
    'shared-ab-1',
    'Team contacts',
    'team-lead@example.com',
    'Team Lead',
    FULL_RIGHTS
  ),
  sharedAddressBook(
    'shared-ab-2',
    'Suppliers',
    'team-lead@example.com',
    'Team Lead'
  ),
  sharedAddressBook(
    'shared-ab-3',
    'Company directory',
    'admin@example.com',
    'Administrator'
  ),
  // Already in the default `demo_address_books` subscriptions.
  sharedAddressBook(
    'contacts',
    'Contacts',
    'otter-fan@example.org',
    'Otter Fan'
  ),
]

const DEFAULT_SUBSCRIBED_KEYS = ['contacts']

const CATALOG_KEYS = new Set(SHARED_ADDRESS_BOOKS_CATALOG.map((b) => b.key))

export function getSubscribedAddressBookKeys(req: NextRequest): string[] {
  const keys = getDemoData<unknown>(
    req,
    SUBSCRIBED_ADDRESS_BOOKS_STORAGE_KEY,
    DEFAULT_SUBSCRIBED_KEYS
  )
  return Array.isArray(keys)
    ? keys.filter((key): key is string => typeof key === 'string')
    : DEFAULT_SUBSCRIBED_KEYS
}

/**
 * Subscriptions to show in the sidebar: stored entries the user is still
 * subscribed to (or that are not in the catalog), plus subscribed catalog
 * address books that are not stored yet.
 */
export function getSubscribedAddressBooks(
  req: NextRequest,
  storedSubscriptions: AddressBook[]
): AddressBook[] {
  const subscribed = new Set(getSubscribedAddressBookKeys(req))
  const kept = storedSubscriptions.filter(
    (book) => !CATALOG_KEYS.has(book.id) || subscribed.has(book.id)
  )
  const keptIds = new Set(kept.map((book) => book.id))
  const added = SHARED_ADDRESS_BOOKS_CATALOG.filter(
    (book) => subscribed.has(book.key) && !keptIds.has(book.key)
  ).map(
    (book): AddressBook => ({
      id: book.key,
      name: book.name,
      description: book.description ?? '',
      type: 'shared',
      owner: book.owner,
    })
  )
  return [...kept, ...added]
}
