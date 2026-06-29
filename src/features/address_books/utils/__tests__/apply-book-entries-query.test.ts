import type { VCard } from '../../address-books-types'
import {
  applyBookEntriesQuery,
  parseBookEntriesQueryFromSearchParams,
} from '../apply-book-entries-query'

const baseContact = (overrides: Partial<VCard> = {}): VCard => ({
  id: '1',
  version: '4.0',
  firstName: 'Alice',
  lastName: 'Martin',
  emails: ['alice@example.com'],
  ...overrides,
})

describe('applyBookEntriesQuery', () => {
  const roster = [
    baseContact({ id: '1', firstName: 'John', lastName: 'Doe' }),
    baseContact({
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      emails: ['jane@example.com'],
    }),
    baseContact({
      id: 'list-1',
      kind: 'group',
      firstName: 'Team John',
      lastName: '',
      members: [],
    }),
  ]

  it('filters contacts by search term', () => {
    const result = applyBookEntriesQuery(roster, { search: 'joh' })

    expect(result.items).toHaveLength(2)
    expect(result.items.map((item) => item.id)).toEqual(['list-1', '1'])
    expect(result.contactTotal).toBe(1)
    expect(result.listTotal).toBe(1)
  })

  it('paginates contacts and lists with the same page window', () => {
    const manyContacts = Array.from({ length: 3 }, (_, index) =>
      baseContact({
        id: `c-${index}`,
        firstName: `User${index}`,
        lastName: 'Test',
      })
    )

    const result = applyBookEntriesQuery([...manyContacts, roster[2]], {
      page: 2,
      page_size: 2,
    })

    expect(result.contactTotal).toBe(3)
    expect(result.totalPages).toBe(2)
    expect(result.page).toBe(2)
    expect(result.items.filter((item) => item.kind !== 'group')).toHaveLength(1)
  })

  it('sorts contacts by last name descending', () => {
    const result = applyBookEntriesQuery(roster, {
      sort_by: 'last_name',
      sort_order: 'desc',
    })

    expect(
      result.items.filter((item) => item.kind !== 'group').map((item) => item.lastName)
    ).toEqual(['Smith', 'Doe'])
  })
})

describe('parseBookEntriesQueryFromSearchParams', () => {
  it('maps URL search params to query args', () => {
    const params = parseBookEntriesQueryFromSearchParams(
      new URLSearchParams(
        'search=joh&page=2&page_size=25&sort_by=last_name&sort_order=desc'
      )
    )

    expect(params).toEqual({
      search: 'joh',
      page: 2,
      page_size: 25,
      sort_by: 'last_name',
      sort_order: 'desc',
    })
  })
})
