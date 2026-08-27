import {
  filterOwnedAddressBooks,
  filterOwnedCalendars,
  flattenMailFolders,
} from '../owned-items'

describe('flattenMailFolders', () => {
  it('flattens nested folders using subfolders', () => {
    const result = flattenMailFolders([
      {
        name: 'Inbox',
        path: 'INBOX',
        selectable: true,
        subfolders: [
          { name: 'Work', path: 'INBOX/Work', selectable: true },
          { name: 'Personal', path: 'INBOX/Personal', selectable: true },
        ],
      } as never,
    ])
    expect(result.map((f) => f.path)).toEqual([
      'INBOX',
      'INBOX/Work',
      'INBOX/Personal',
    ])
  })

  it('falls back to children when subfolders is absent', () => {
    const result = flattenMailFolders([
      {
        name: 'Inbox',
        path: 'INBOX',
        selectable: true,
        children: [{ name: 'Work', path: 'INBOX/Work', selectable: true }],
      } as never,
    ])
    expect(result.map((f) => f.path)).toEqual(['INBOX', 'INBOX/Work'])
  })

  it('excludes non-selectable (virtual) folders but still descends into their children', () => {
    const result = flattenMailFolders([
      {
        name: 'Virtual',
        path: 'VIRTUAL',
        selectable: false,
        subfolders: [{ name: 'Real', path: 'VIRTUAL/Real', selectable: true }],
      } as never,
    ])
    expect(result.map((f) => f.path)).toEqual(['VIRTUAL/Real'])
  })

  it('returns an empty array for an empty tree', () => {
    expect(flattenMailFolders([])).toEqual([])
  })
})

describe('filterOwnedCalendars', () => {
  it('keeps only personal calendars', () => {
    const result = filterOwnedCalendars([
      { name: 'Mine', source_type: 'local' } as never,
      { name: 'Shared', source_type: 'shared' } as never,
      { name: 'Subscribed', source_type: 'subscription' } as never,
    ])
    expect(result.map((c) => c.name)).toEqual(['Mine'])
  })
})

describe('filterOwnedAddressBooks', () => {
  it('returns only the personals collection', () => {
    const result = filterOwnedAddressBooks({
      globals: [{ id: 'g1', name: 'Global' } as never],
      personals: [{ id: 'p1', name: 'Mine' } as never],
      subscriptions: [{ id: 's1', name: 'Subscribed' } as never],
    })
    expect(result.map((b) => b.name)).toEqual(['Mine'])
  })
})
