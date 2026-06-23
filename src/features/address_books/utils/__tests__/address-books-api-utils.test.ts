import { normalizeAddressBook, normalizeAddressBooksResponse } from '../normalize-address-book'
import { normalizeContact, normalizeContactsList } from '../normalize-contact'
import { normalizeDistributionList } from '../normalize-list'
import { mergeBookEntries } from '../merge-book-entries'
import { parseXPaginationHeader } from '../parse-x-pagination'
import { unwrapApiData } from '../unwrap-api-data'

describe('unwrapApiData', () => {
  it('unwraps backend envelope', () => {
    expect(unwrapApiData({ data: { foo: 1 }, error_code: 'S000000' })).toEqual({
      foo: 1,
    })
  })

  it('returns raw payload when not wrapped', () => {
    expect(unwrapApiData({ foo: 1 })).toEqual({ foo: 1 })
  })
})

describe('normalizeAddressBook', () => {
  it('maps backend fields to UI model', () => {
    expect(
      normalizeAddressBook({
        key: 'ab-1',
        name: 'Work',
        description: 'desc',
        is_default: true,
        source_type: 'local',
      })
    ).toEqual({
      id: 'ab-1',
      name: 'Work',
      description: 'desc',
      type: 'personal',
      default: true,
    })
  })
})

describe('normalizeAddressBooksResponse', () => {
  it('keeps fakeApi shape', () => {
    const fake = {
      personals: [{ id: 'work', name: 'Work', description: '', type: 'personal' as const }],
      globals: [],
      subscriptions: [],
    }
    expect(normalizeAddressBooksResponse(fake)).toBe(fake)
  })

  it('maps backend list into personals', () => {
    const result = normalizeAddressBooksResponse({
      data: {
        addressbooks: [
          { key: 'ab-1', name: 'Personal', source_type: 'local', is_default: true },
        ],
        total_count: 1,
      },
      error_code: 'S000000',
    })
    expect(result.personals).toHaveLength(1)
    expect(result.personals[0].id).toBe('ab-1')
    expect(result.personals[0].default).toBe(true)
  })
})

describe('normalizeContact', () => {
  it('maps api contact to VCard', () => {
    const vcard = normalizeContact({
      key: 'ct-1',
      first_name: 'John',
      last_name: 'Doe',
      emails: [{ value: 'john@example.com' }],
      phones: [{ number: '+33123456789' }],
    })

    expect(vcard.id).toBe('ct-1')
    expect(vcard.firstName).toBe('John')
    expect(vcard.emails).toEqual(['john@example.com'])
    expect(vcard.phoneNumbers).toEqual(['+33123456789'])
  })
})

describe('normalizeDistributionList', () => {
  it('maps list members using contact lookup', () => {
    const contacts = normalizeContactsList([
      {
        key: 'm1',
        first_name: 'Alice',
        last_name: 'Martin',
        emails: [{ value: 'alice@example.com' }],
      },
    ])

    const list = normalizeDistributionList(
      {
        key: 'list-1',
        name: 'Team',
        members: ['m1'],
      },
      new Map(contacts.map((contact) => [contact.id, contact]))
    )

    expect(list.kind).toBe('group')
    expect(list.firstName).toBe('Team')
    expect(list.members?.[0].email).toBe('alice@example.com')
  })
})

describe('mergeBookEntries', () => {
  it('places lists before contacts', () => {
    const contacts = [{ id: 'c1', version: '4.0', firstName: 'A', lastName: 'B' }]
    const lists = [
      { id: 'l1', version: '4.0', kind: 'group' as const, firstName: 'List', lastName: '' },
    ]
    expect(mergeBookEntries(contacts, lists).map((item) => item.id)).toEqual([
      'l1',
      'c1',
    ])
  })
})

describe('parseXPaginationHeader', () => {
  it('parses pagination header json', () => {
    expect(
      parseXPaginationHeader(
        JSON.stringify({ total: 42, total_pages: 3, page: 2 })
      )
    ).toEqual({ total: 42, totalPages: 3, page: 2 })
  })
})
