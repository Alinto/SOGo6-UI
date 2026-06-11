import { renderHook } from '@testing-library/react'

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      addressBooksUi: { formBookId: null },
    }),
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'route-book' }),
}))

const mockUseGetVCardQuery = jest.fn()

jest.mock('../../store/address-books-api', () => ({
  useGetAddressBooksQuery: () => ({
    data: {
      personals: [{ id: 'default-book', default: true }],
      subscriptions: [],
      globals: [],
    },
    isLoading: false,
    isError: false,
  }),
  useGetVCardQuery: () => mockUseGetVCardQuery(),
}))

import {
  useAddressBookEditState,
  useAddressBookState,
} from '../use-address-book-state'

describe('useAddressBookState', () => {
  it('resolves activeBookId from route then default', () => {
    const { result } = renderHook(() => useAddressBookState())
    expect(result.current.activeBookId).toBe('route-book')
    expect(mockDispatch).toHaveBeenCalled()
  })
})

describe('useAddressBookEditState', () => {
  beforeEach(() => {
    mockUseGetVCardQuery.mockReturnValue({
      currentData: undefined,
      isFetching: true,
      isError: false,
    })
  })

  it('reports loading when editing and entity not ready', () => {
    const { result } = renderHook(() =>
      useAddressBookEditState('c1', 'work', true)
    )
    expect(result.current.isEditLoading).toBe(true)
    expect(result.current.editingEntity).toBeUndefined()
  })
})
