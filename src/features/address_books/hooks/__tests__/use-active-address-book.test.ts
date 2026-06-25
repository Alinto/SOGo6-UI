import { renderHook } from '@testing-library/react'

const mockUseGetAddressBooksQuery = jest.fn()
const mockUseParams = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}))

jest.mock('../../store/address-books-api', () => ({
  useGetAddressBooksQuery: () => mockUseGetAddressBooksQuery(),
}))

import {
  useActiveAddressBook,
  useActiveAddressBookWritable,
} from '../use-active-address-book'

const books = {
  personals: [{ id: 'work', name: 'Work', type: 'personal' as const, description: '' }],
  subscriptions: [{ id: 'sub1', name: 'Shared', type: 'shared' as const, description: '' }],
  globals: [],
}

describe('useActiveAddressBook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetAddressBooksQuery.mockReturnValue({ data: books })
    mockUseParams.mockReturnValue({ book_id: 'work' })
  })

  it('returns active book from route params', () => {
    const { result } = renderHook(() => useActiveAddressBook())
    expect(result.current?.id).toBe('work')
    expect(result.current?.name).toBe('Work')
  })

  it('returns null when book id is missing', () => {
    mockUseParams.mockReturnValue({})
    const { result } = renderHook(() => useActiveAddressBook())
    expect(result.current).toBeNull()
  })
})

describe('useActiveAddressBookWritable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetAddressBooksQuery.mockReturnValue({ data: books })
  })

  it('marks personal book as writable', () => {
    mockUseParams.mockReturnValue({ book_id: 'work' })
    const { result } = renderHook(() => useActiveAddressBookWritable())
    expect(result.current.writable).toBe(true)
    expect(result.current.book?.id).toBe('work')
  })

  it('marks shared book as read-only', () => {
    mockUseParams.mockReturnValue({ book_id: 'sub1' })
    const { result } = renderHook(() => useActiveAddressBookWritable())
    expect(result.current.writable).toBe(false)
  })

  it('marks all-contacts view as read-only', () => {
    mockUseParams.mockReturnValue({ book_id: 'all' })
    const { result } = renderHook(() => useActiveAddressBookWritable())
    expect(result.current.writable).toBe(false)
    expect(result.current.book).toBeNull()
    expect(result.current.bookId).toBe('all')
  })
})
