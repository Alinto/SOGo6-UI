import { renderHook } from '@testing-library/react'
import { skipToken } from '@reduxjs/toolkit/query'

const mockUseGetAddressBookVCardsQuery = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      addressBooksUi: {
        searchQuery: 'alice',
        sortOrder: 'asc',
        sortBy: 'display_name',
        page: 2,
        pageSize: 25,
      },
    }),
}))

jest.mock('../../store/address-books-api', () => ({
  useGetAddressBookVCardsQuery: (arg: unknown) =>
    mockUseGetAddressBookVCardsQuery(arg),
}))

jest.mock('../use-contact-search-min-length', () => ({
  useContactSearchMinLength: () => 2,
}))

import {
  selectBookEntriesItems,
  useAddressBookEntries,
} from '../use-address-book-entries'

describe('useAddressBookEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetAddressBookVCardsQuery.mockReturnValue({
      data: {
        items: [{ id: 'c1', version: '4.0', firstName: 'Alice', lastName: 'Martin' }],
        total: 1,
        page: 2,
        totalPages: 1,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    })
  })

  describe('basic rendering', () => {
    it('returns entries from query data', () => {
      const { result } = renderHook(() => useAddressBookEntries('work'))
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].id).toBe('c1')
      expect(result.current.total).toBe(1)
      expect(result.current.page).toBe(2)
    })

    it('uses skipToken when bookId is missing', () => {
      renderHook(() => useAddressBookEntries(null))
      expect(mockUseGetAddressBookVCardsQuery).toHaveBeenCalledWith(skipToken)
    })
  })

  describe('configuration', () => {
    it('passes search and pagination params to the query', () => {
      renderHook(() => useAddressBookEntries('work'))
      expect(mockUseGetAddressBookVCardsQuery).toHaveBeenCalledWith({
        bookId: 'work',
        params: {
          search: 'alice',
          page: 2,
          page_size: 25,
          sort_by: 'display_name',
          sort_order: 'asc',
        },
      })
    })
  })
})

describe('selectBookEntriesItems', () => {
  it('returns items array from response', () => {
    expect(
      selectBookEntriesItems({
        items: [{ id: 'c1', version: '4.0', firstName: 'A', lastName: 'B' }],
        total: 1,
        page: 1,
        totalPages: 1,
      })
    ).toHaveLength(1)
  })

  it('returns empty array when data is undefined', () => {
    expect(selectBookEntriesItems(undefined)).toEqual([])
  })
})
