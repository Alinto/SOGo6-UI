import type { AddressBook } from '@/features/address_books/address-books-types'
import type { NextRequest } from 'next/server'
import {
  SHARED_ADDRESS_BOOKS_CATALOG,
  SUBSCRIBED_ADDRESS_BOOKS_STORAGE_KEY,
  getSubscribedAddressBookKeys,
  getSubscribedAddressBooks,
} from '../shared-address-books-store'

const requestWithKeys = (keys?: unknown): NextRequest =>
  ({
    cookies: {
      get: (name: string) =>
        name === SUBSCRIBED_ADDRESS_BOOKS_STORAGE_KEY && keys !== undefined
          ? { value: JSON.stringify(keys) }
          : undefined,
    },
  }) as unknown as NextRequest

const stored = (id: string, owner?: string): AddressBook => ({
  id,
  name: `Stored ${id}`,
  description: '',
  type: 'shared',
  owner,
})

const ids = (books: AddressBook[]) => books.map((b) => b.id)

describe('shared-address-books-store', () => {
  it('lists Team Lead with several address books', () => {
    expect(
      SHARED_ADDRESS_BOOKS_CATALOG.filter((b) => b.name_owner === 'Team Lead')
        .length
    ).toBeGreaterThan(1)
  })

  it('subscribes to the default shared address book without a cookie', () => {
    expect(getSubscribedAddressBookKeys(requestWithKeys())).toEqual([
      'contacts',
    ])
  })

  it('falls back to the defaults on an invalid cookie', () => {
    expect(getSubscribedAddressBookKeys(requestWithKeys('nope'))).toEqual([
      'contacts',
    ])
  })

  it('keeps the stored default subscription while subscribed', () => {
    const result = getSubscribedAddressBooks(requestWithKeys(), [
      stored('contacts', 'otter-fan@example.org'),
    ])

    expect(ids(result)).toEqual(['contacts'])
    expect(result[0].name).toBe('Stored contacts')
  })

  it('adds a subscribed catalog address book once, keyed by id', () => {
    const result = getSubscribedAddressBooks(
      requestWithKeys(['contacts', 'shared-ab-2']),
      [stored('contacts')]
    )

    expect(ids(result)).toEqual(['contacts', 'shared-ab-2'])
    expect(result[1]).toEqual({
      id: 'shared-ab-2',
      name: 'Suppliers',
      description: '',
      type: 'shared',
      owner: 'team-lead@example.com',
    })
  })

  it('hides a stored shared address book once unsubscribed', () => {
    const result = getSubscribedAddressBooks(requestWithKeys([]), [
      stored('contacts'),
    ])

    expect(ids(result)).toEqual([])
  })

  it('keeps stored subscriptions that are not in the catalog', () => {
    const result = getSubscribedAddressBooks(requestWithKeys([]), [
      stored('my-subscription'),
    ])

    expect(ids(result)).toEqual(['my-subscription'])
  })
})
