import { renderHook } from '@testing-library/react'
import { skipToken } from '@reduxjs/toolkit/query'

const mockUseSearchAllContactsQuery = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      addressBooksUi: {
        searchQuery: 'alice',
        sortOrder: 'asc',
        sortBy: 'display_name',
        page: 1,
        pageSize: 25,
      },
    }),
}))

jest.mock('../../store/address-books-api', () => ({
  useSearchAllContactsQuery: (arg: unknown) => mockUseSearchAllContactsQuery(arg),
}))

jest.mock('../use-contact-search-min-length', () => ({
  useContactSearchMinLength: () => 2,
}))

import { useAllContactsEntries } from '../use-all-contacts-entries'

describe('useAllContactsEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSearchAllContactsQuery.mockReturnValue({
      data: {
        items: [{ id: 'c1', version: '4.0', firstName: 'Alice', lastName: 'Martin' }],
        contactTotal: 1,
        total: 1,
        page: 1,
        totalPages: 1,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    })
  })

  it('returns all-contacts entries from query', () => {
    const { result } = renderHook(() => useAllContactsEntries(true))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.listTotal).toBe(0)
    expect(result.current.bookId).toBe('all')
  })

  it('uses skipToken when disabled', () => {
    renderHook(() => useAllContactsEntries(false))
    expect(mockUseSearchAllContactsQuery).toHaveBeenCalledWith(skipToken)
  })

  it('passes search params to query when enabled', () => {
    renderHook(() => useAllContactsEntries(true))
    expect(mockUseSearchAllContactsQuery).toHaveBeenCalledWith({
      params: {
        search: 'alice',
        page: 1,
        page_size: 25,
        sort_by: 'display_name',
        sort_order: 'asc',
      },
      minSearchLength: 2,
    })
  })
})
