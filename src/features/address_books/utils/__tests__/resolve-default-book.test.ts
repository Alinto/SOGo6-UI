import type { AddressBooks } from '../../address-books-types'
import {
  resolveDefaultAddressBookId,
  resolveDefaultBookId,
} from '../resolve-default-book'

describe('resolveDefaultBookId', () => {
  it('returns the default personal book id', () => {
    const id = resolveDefaultBookId([
      { id: 'a', default: false },
      { id: 'b', default: true },
    ])
    expect(id).toBe('b')
  })

  it('falls back to the first personal book', () => {
    const id = resolveDefaultBookId([{ id: 'first' }, { id: 'second' }])
    expect(id).toBe('first')
  })

  it('returns null when there are no personal books', () => {
    expect(resolveDefaultBookId([])).toBeNull()
  })
})

describe('resolveDefaultAddressBookId', () => {
  const books: AddressBooks = {
    personals: [{ id: 'p1', name: 'P', description: '', type: 'personal' }],
    subscriptions: [{ id: 's1', name: 'S', description: '', type: 'shared' }],
    globals: [{ id: 'g1', name: 'G', description: '', type: 'global' }],
  }

  it('prefers personal books', () => {
    expect(resolveDefaultAddressBookId(books)).toBe('p1')
  })

  it('falls back to subscriptions then globals', () => {
    expect(
      resolveDefaultAddressBookId({ ...books, personals: [] })
    ).toBe('s1')
    expect(
      resolveDefaultAddressBookId({
        personals: [],
        subscriptions: [],
        globals: books.globals,
      })
    ).toBe('g1')
  })
})
