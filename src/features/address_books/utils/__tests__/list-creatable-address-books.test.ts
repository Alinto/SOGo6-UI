import type { AddressBook, AddressBooks } from '../../address-books-types'
import { listCreatableAddressBooks } from '../list-creatable-address-books'

function book(overrides: Partial<AddressBook>): AddressBook {
  return {
    id: 'book',
    name: 'Book',
    description: '',
    type: 'personal',
    ...overrides,
  }
}

function books(
  personals: AddressBook[],
  subscriptions: AddressBook[] = [],
  globals: AddressBook[] = []
): AddressBooks {
  return { personals, subscriptions, globals }
}

describe('listCreatableAddressBooks', () => {
  it('keeps personal books and drops the all-contacts view', () => {
    const result = listCreatableAddressBooks(
      books([
        book({ id: 'all', name: 'All', type: 'personal' }),
        book({ id: 'home', name: 'Home' }),
      ])
    )

    expect(result.map((entry) => entry.id)).toEqual(['home'])
  })

  it('includes a shared book only when create rights are known', () => {
    const shared = book({ id: 'shared', name: 'Shared', type: 'shared' })
    const collection = books([book({ id: 'home', name: 'Home' })], [shared])

    expect(
      listCreatableAddressBooks(collection).map((entry) => entry.id)
    ).toEqual(['home'])

    expect(
      listCreatableAddressBooks(collection, {
        shared: {
          can_view: true,
          can_create_objects: true,
          can_edit_objects: false,
          can_erase_objects: false,
        },
      }).map((entry) => entry.id)
    ).toEqual(['home', 'shared'])
  })
})
