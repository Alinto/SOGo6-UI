import { renderHook } from '@testing-library/react'

const mockUseSearchContactsAutocompleteQuery = jest.fn()

jest.mock('../../store/address-books-api', () => ({
  useSearchContactsAutocompleteQuery: (...args: unknown[]) =>
    mockUseSearchContactsAutocompleteQuery(...args),
}))

import { useRecipientSuggestions } from '../use-recipient-suggestions'

describe('useRecipientSuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSearchContactsAutocompleteQuery.mockReturnValue({
      data: [],
      isFetching: false,
    })
  })

  describe('basic rendering', () => {
    it('skips the autocomplete query for short queries', () => {
      const { result } = renderHook(() => useRecipientSuggestions('a'))
      expect(result.current.suggestions).toEqual([])
      expect(mockUseSearchContactsAutocompleteQuery).toHaveBeenCalledWith(
        { q: 'a' },
        { skip: true }
      )
    })

    it('returns contact suggestions from the autocomplete API', () => {
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

      const { result } = renderHook(() => useRecipientSuggestions(' al '))
      expect(mockUseSearchContactsAutocompleteQuery).toHaveBeenCalledWith(
        { q: 'al' },
        { skip: false }
      )
      expect(result.current.suggestions).toEqual([
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
      mockUseSearchContactsAutocompleteQuery.mockReturnValue({
        data: [
          { type: 'contact', name: 'Dup', email: 'dup@example.com' },
          {
            type: 'list',
            name: 'Team',
            members: [{ name: 'Dup', email: 'DUP@example.com' }],
          },
        ],
        isFetching: false,
      })

      const { result } = renderHook(() => useRecipientSuggestions('du'))
      expect(result.current.suggestions).toHaveLength(1)
    })

    it('reports fetching while the autocomplete query is loading', () => {
      mockUseSearchContactsAutocompleteQuery.mockReturnValue({
        data: [],
        isFetching: true,
      })

      const { result } = renderHook(() => useRecipientSuggestions('ab'))
      expect(result.current.isFetching).toBe(true)
    })
  })
})
