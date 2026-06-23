import { renderHook } from '@testing-library/react'

const mockUseSearchUsersQuery = jest.fn()
const mockUseSearchContactsAutocompleteQuery = jest.fn()

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useSearchUsersQuery: (...args: unknown[]) => mockUseSearchUsersQuery(...args),
}))

jest.mock('../../store/address-books-api', () => ({
  useSearchContactsAutocompleteQuery: (...args: unknown[]) =>
    mockUseSearchContactsAutocompleteQuery(...args),
}))

import { useRecipientSuggestions } from '../use-recipient-suggestions'

describe('useRecipientSuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSearchUsersQuery.mockReturnValue({
      data: [],
      isFetching: false,
    })
    mockUseSearchContactsAutocompleteQuery.mockReturnValue({
      data: [],
      isFetching: false,
    })
  })

  describe('basic rendering', () => {
    it('returns empty suggestions for short queries', () => {
      const { result } = renderHook(() => useRecipientSuggestions('a'))
      expect(result.current.suggestions).toEqual([])
    })

    it('merges users and contact suggestions', () => {
      mockUseSearchUsersQuery.mockReturnValue({
        data: [{ uid: 'u1', email: 'user@example.com', name: 'User One' }],
        isFetching: false,
      })
      mockUseSearchContactsAutocompleteQuery.mockReturnValue({
        data: [
          {
            type: 'contact',
            name: 'Alice Martin',
            email: 'alice@example.com',
          },
        ],
        isFetching: false,
      })

      const { result } = renderHook(() => useRecipientSuggestions('al'))
      expect(result.current.suggestions).toEqual([
        { email: 'user@example.com', name: 'User One', source: 'user' },
        { email: 'alice@example.com', name: 'Alice Martin', source: 'contact' },
      ])
    })
  })

  describe('integration', () => {
    it('expands distribution list members', () => {
      mockUseSearchContactsAutocompleteQuery.mockReturnValue({
        data: [
          {
            type: 'list',
            name: 'Sales Team',
            members: [
              { contact_key: 'c1', name: 'Bob', email: 'bob@example.com' },
              { contact_key: 'c2', name: 'Carol', email: 'carol@example.com' },
            ],
          },
        ],
        isFetching: false,
      })

      const { result } = renderHook(() => useRecipientSuggestions('sa'))
      expect(result.current.suggestions).toEqual([
        { email: 'bob@example.com', name: 'Bob', source: 'list' },
        { email: 'carol@example.com', name: 'Carol', source: 'list' },
      ])
    })

    it('deduplicates emails case-insensitively', () => {
      mockUseSearchUsersQuery.mockReturnValue({
        data: [{ uid: 'u1', email: 'dup@example.com', name: 'User' }],
        isFetching: false,
      })
      mockUseSearchContactsAutocompleteQuery.mockReturnValue({
        data: [
          { type: 'contact', name: 'Dup', email: 'DUP@example.com' },
        ],
        isFetching: false,
      })

      const { result } = renderHook(() => useRecipientSuggestions('du'))
      expect(result.current.suggestions).toHaveLength(1)
    })

    it('reports fetching when either query is loading', () => {
      mockUseSearchUsersQuery.mockReturnValue({
        data: [],
        isFetching: true,
      })

      const { result } = renderHook(() => useRecipientSuggestions('ab'))
      expect(result.current.isFetching).toBe(true)
    })
  })
})
