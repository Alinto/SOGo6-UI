import {
  normalizeAddressBook,
  normalizeAddressBooksResponse,
  normalizeSingleAddressBookResponse,
} from '../normalize-address-book'

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

  it('maps ldap and carddav source types', () => {
    expect(
      normalizeAddressBook({
        key: 'g1',
        name: 'Directory',
        source_type: 'ldap',
      }).type
    ).toBe('global')

    expect(
      normalizeAddressBook({
        key: 's1',
        name: 'Shared',
        source_type: 'carddav',
      }).type
    ).toBe('shared')
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

  it('maps backend list into buckets by source type', () => {
    const result = normalizeAddressBooksResponse({
      data: {
        addressbooks: [
          { key: 'p1', name: 'Personal', source_type: 'local', is_default: true },
          { key: 'g1', name: 'LDAP', source_type: 'ldap' },
          { key: 's1', name: 'CardDAV', source_type: 'carddav' },
        ],
        total_count: 3,
      },
      error_code: 'S000000',
    })

    expect(result.personals).toHaveLength(1)
    expect(result.globals).toHaveLength(1)
    expect(result.subscriptions).toHaveLength(1)
    expect(result.personals[0].default).toBe(true)
  })
})

describe('normalizeSingleAddressBookResponse', () => {
  it('returns already normalized address book', () => {
    const book = {
      id: 'work',
      name: 'Work',
      description: '',
      type: 'personal' as const,
      default: false,
    }
    expect(normalizeSingleAddressBookResponse(book)).toBe(book)
  })

  it('unwraps backend single book response', () => {
    expect(
      normalizeSingleAddressBookResponse({
        data: {
          key: 'ab-1',
          name: 'Personal',
          source_type: 'local',
        },
        error_code: 'S000000',
      })
    ).toEqual({
      id: 'ab-1',
      name: 'Personal',
      description: '',
      type: 'personal',
      default: false,
    })
  })
})
