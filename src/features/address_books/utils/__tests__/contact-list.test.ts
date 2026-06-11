import {
  filterAndSortContacts,
  getContactDisplayName,
  parseContactName,
  partitionAddressBookEntries,
} from '../contact-list'
import type { VCard } from '../../address-books-types'

const baseContact = (overrides: Partial<VCard> = {}): VCard => ({
  id: '1',
  version: '4.0',
  firstName: 'Alice',
  lastName: 'Martin',
  emails: ['alice@example.com'],
  ...overrides,
})

describe('contact-list utils', () => {
  it('formats display name', () => {
    expect(getContactDisplayName(baseContact())).toBe('Alice Martin')
  })

  it('filters contacts by name and email', () => {
    const items = [
      baseContact(),
      baseContact({
        id: '2',
        firstName: 'Bob',
        lastName: 'Smith',
        emails: ['bob@example.com'],
      }),
    ]
    const result = filterAndSortContacts(items, 'bob', 'asc')
    expect(result).toHaveLength(1)
    expect(result[0].firstName).toBe('Bob')
  })

  it('partitions lists before contacts', () => {
    const items = [
      baseContact({ id: '1', firstName: 'Alice', lastName: 'Martin' }),
      baseContact({
        id: 'list-1',
        kind: 'group',
        firstName: 'Team',
        lastName: '',
        members: [],
      }),
      baseContact({ id: '2', firstName: 'Bob', lastName: 'Smith' }),
    ]
    const { distributionLists, contacts } = partitionAddressBookEntries(
      items,
      '',
      'asc'
    )
    expect(distributionLists).toHaveLength(1)
    expect(distributionLists[0].id).toBe('list-1')
    expect(contacts).toHaveLength(2)
    expect(filterAndSortContacts(items, '', 'asc')[0].id).toBe('list-1')
  })

  it('sorts contacts by last name', () => {
    const items = [
      baseContact({ lastName: 'Zulu' }),
      baseContact({ id: '2', firstName: 'Bob', lastName: 'Alpha' }),
    ]
    const asc = filterAndSortContacts(items, '', 'asc')
    expect(asc[0].lastName).toBe('Alpha')
    const desc = filterAndSortContacts(items, '', 'desc')
    expect(desc[0].lastName).toBe('Zulu')
  })

  it('parses contact names', () => {
    expect(parseContactName('John Doe')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    })
    expect(parseContactName('john@example.com')).toEqual({
      firstName: 'john@example.com',
      lastName: '',
    })
  })
})
