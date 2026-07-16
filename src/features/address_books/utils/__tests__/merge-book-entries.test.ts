import {
  buildBookEntriesResponse,
  isDistributionListEntry,
  listTagId,
  mergeBookEntries,
  normalizeSingleEntry,
  parseContactsAndListsFromBackend,
  parseFakeBookEntries,
  parseListTagId,
} from '../merge-book-entries'

describe('mergeBookEntries', () => {
  it('places lists before contacts', () => {
    const contacts = [
      { id: 'c1', version: '4.0', firstName: 'A', lastName: 'B' },
    ]
    const lists = [
      {
        id: 'l1',
        version: '4.0',
        kind: 'group' as const,
        firstName: 'List',
        lastName: '',
      },
    ]

    expect(mergeBookEntries(contacts, lists).map((item) => item.id)).toEqual([
      'l1',
      'c1',
    ])
  })
})

describe('buildBookEntriesResponse', () => {
  it('uses pagination metadata when provided', () => {
    const result = buildBookEntriesResponse([], [], {
      total: 42,
      totalPages: 3,
      page: 2,
    })

    expect(result).toEqual({
      items: [],
      total: 42,
      contactTotal: 42,
      listTotal: 0,
      page: 2,
      totalPages: 3,
    })
  })

  it('uses the higher page count when contacts and lists paginate differently', () => {
    const result = buildBookEntriesResponse(
      [],
      [],
      { total: 10, totalPages: 2, page: 1 },
      {
        listTotal: 50,
        listsPagination: { total: 50, totalPages: 5, page: 1 },
      }
    )

    expect(result.totalPages).toBe(5)
    expect(result.listTotal).toBe(50)
  })
})

describe('parseContactsAndListsFromBackend', () => {
  it('merges wrapped contacts and lists payloads', () => {
    const result = parseContactsAndListsFromBackend(
      {
        data: {
          contacts: [
            {
              key: 'c1',
              first_name: 'Alice',
              last_name: 'Martin',
              emails: [{ value: 'alice@example.com' }],
            },
          ],
        },
        error_code: 'S000000',
      },
      {
        data: {
          lists: [{ key: 'l1', name: 'Team', members: ['c1'] }],
        },
        error_code: 'S000000',
      },
      { total: 1, totalPages: 1, page: 1 },
      undefined,
      { total: 1, totalPages: 1, page: 1 }
    )

    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(1)
    expect(result.contactTotal).toBe(1)
    expect(result.listTotal).toBe(1)
    expect(result.items[0].kind).toBe('group')
    expect(result.items[1].firstName).toBe('Alice')
  })
})

describe('parseFakeBookEntries', () => {
  it('wraps fakeApi array into paginated response', () => {
    const result = parseFakeBookEntries([
      { id: 'c1', version: '4.0', firstName: 'Alice', lastName: 'Martin' },
    ])

    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
    expect(result.totalPages).toBe(1)
  })
})

describe('list tag helpers', () => {
  it('detects distribution list entries', () => {
    expect(
      isDistributionListEntry({
        id: 'l1',
        version: '4.0',
        kind: 'group',
        firstName: 'Team',
        lastName: '',
      })
    ).toBe(true)
  })

  it('builds and parses list cache tag ids', () => {
    expect(listTagId('list-1')).toBe('list:list-1')
    expect(parseListTagId('list:list-1')).toBe('list-1')
    expect(parseListTagId('contact-1')).toBeNull()
  })
})

describe('normalizeSingleEntry', () => {
  it('normalizes a contact payload', () => {
    const entry = normalizeSingleEntry({
      key: 'c1',
      first_name: 'John',
      last_name: 'Doe',
    })

    expect(entry.id).toBe('c1')
    expect(entry.firstName).toBe('John')
  })

  it('normalizes a distribution list payload', () => {
    const entry = normalizeSingleEntry({
      key: 'l1',
      name: 'Team',
      members: [],
    })

    expect(entry.kind).toBe('group')
    expect(entry.firstName).toBe('Team')
  })

  it('resolves list member names when a contact lookup map is provided', () => {
    const contacts = new Map([
      [
        'c1',
        {
          id: 'c1',
          version: '4.0',
          firstName: 'Alice',
          lastName: 'Martin',
          emails: ['alice@example.com'],
        },
      ],
    ])

    const entry = normalizeSingleEntry(
      {
        key: 'l1',
        name: 'Team',
        members: ['c1'],
      },
      contacts
    )

    expect(entry.members?.[0]).toEqual({
      contactId: 'c1',
      email: 'alice@example.com',
      displayName: 'Alice Martin',
    })
  })
})
