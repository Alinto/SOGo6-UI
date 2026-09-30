import { renderHook } from '@testing-library/react'

const mockUseSearchGabAutocompleteQuery = jest.fn()
const mockUseProfile = jest.fn()

jest.mock('../../store/address-books-api', () => ({
  useSearchGabAutocompleteQuery: (...args: unknown[]) =>
    mockUseSearchGabAutocompleteQuery(...args),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: () => mockUseProfile(),
}))

import { useShareUserSuggestions } from '../use-share-user-suggestions'

describe('useShareUserSuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseProfile.mockReturnValue({
      user: { uid: 'me', email: 'me@example.com', cn: 'Me' },
      allMailboxes: [
        {
          id: '0',
          identities: [
            { mail: 'me@example.com', isDefault: true },
            { mail: 'me.alias@example.com', isDefault: false },
          ],
        },
      ],
    })
    mockUseSearchGabAutocompleteQuery.mockReturnValue({
      data: [],
      isFetching: false,
    })
  })

  it('skips the directory query for short queries', () => {
    const { result } = renderHook(() => useShareUserSuggestions('a'))
    expect(result.current.suggestions).toEqual([])
    expect(mockUseSearchGabAutocompleteQuery).toHaveBeenCalledWith(
      { q: 'a' },
      { skip: true }
    )
  })

  it('skips the directory query when the caller opts out', () => {
    renderHook(() => useShareUserSuggestions('alice', true))
    expect(mockUseSearchGabAutocompleteQuery).toHaveBeenCalledWith(
      { q: 'alice' },
      { skip: true }
    )
  })

  it('maps directory contacts to share users and drops lists', () => {
    mockUseSearchGabAutocompleteQuery.mockReturnValue({
      data: [
        {
          type: 'contact',
          name: 'Alice Martin',
          email: 'alice@example.com',
          contactKey: 'alice',
          addressBookName: 'Directory',
        },
        {
          type: 'list',
          name: 'Team',
          members: [{ email: 'bob@example.com', name: 'Bob' }],
        },
        { type: 'contact', name: 'No mail', contactKey: 'nomail' },
        { type: 'contact', name: 'No uid', email: 'nouid@example.com' },
      ],
      isFetching: false,
    })

    const { result } = renderHook(() => useShareUserSuggestions(' al '))
    expect(mockUseSearchGabAutocompleteQuery).toHaveBeenCalledWith(
      { q: 'al' },
      { skip: false }
    )
    expect(result.current.suggestions).toEqual([
      {
        uid: 'alice',
        email: 'alice@example.com',
        name: 'Alice Martin',
      },
    ])
  })

  it('keeps one row per directory uid', () => {
    mockUseSearchGabAutocompleteQuery.mockReturnValue({
      data: [
        {
          type: 'contact',
          name: 'Alice',
          email: 'alice@example.com',
          contactKey: 'alice',
        },
        {
          type: 'contact',
          name: 'Alice',
          email: 'alice.work@example.com',
          contactKey: 'alice',
        },
      ],
      isFetching: false,
    })

    const { result } = renderHook(() => useShareUserSuggestions('al'))
    expect(result.current.suggestions).toEqual([
      { uid: 'alice', email: 'alice@example.com', name: 'Alice' },
    ])
  })

  it('drops the current user matched by uid or email', () => {
    mockUseSearchGabAutocompleteQuery.mockReturnValue({
      data: [
        {
          type: 'contact',
          name: 'Me',
          email: 'other@example.com',
          contactKey: 'me',
        },
        {
          type: 'contact',
          name: 'Alias',
          email: 'me.alias@example.com',
          contactKey: 'alias-account',
        },
        {
          type: 'contact',
          name: 'Other',
          email: 'other.person@example.com',
          contactKey: 'other',
        },
      ],
      isFetching: false,
    })

    const { result } = renderHook(() => useShareUserSuggestions('me'))
    expect(result.current.suggestions).toEqual([
      {
        uid: 'other',
        email: 'other.person@example.com',
        name: 'Other',
      },
    ])
  })

  it('reports fetching only while the directory query is loading', () => {
    mockUseSearchGabAutocompleteQuery.mockReturnValue({
      data: [],
      isFetching: true,
    })

    const { result } = renderHook(() => useShareUserSuggestions('ab'))
    expect(result.current.isFetching).toBe(true)

    const skipped = renderHook(() => useShareUserSuggestions('a'))
    expect(skipped.result.current.isFetching).toBe(false)
  })
})
