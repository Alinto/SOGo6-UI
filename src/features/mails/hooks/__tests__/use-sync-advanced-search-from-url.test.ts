import { renderHook } from '@testing-library/react'

const mockDispatch = jest.fn()
const mockUseParams = jest.fn(() => ({
  account: '0',
  folder: 'advanced-search',
}))
const mockUseSearchParams = jest.fn(() => new URLSearchParams('from=jane'))
const mockMailSearchState = {
  isActive: false,
  accountId: null as string | null,
  params: null as unknown,
  folder: null as string | null,
}

jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
  useSearchParams: () => mockUseSearchParams(),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ mailSearch: mockMailSearchState }),
}))

jest.mock('../../store/mail-search-slice', () => ({
  setMailSearch: jest.fn((payload) => ({
    type: 'mailSearch/setMailSearch',
    payload,
  })),
}))

import { setMailSearch } from '../../store/mail-search-slice'
import { useSyncAdvancedSearchFromUrl } from '../use-sync-advanced-search-from-url'

describe('useSyncAdvancedSearchFromUrl', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockUseParams.mockReturnValue({ account: '0', folder: 'advanced-search' })
    mockUseSearchParams.mockReturnValue(new URLSearchParams('from=jane'))
    mockMailSearchState.isActive = false
    mockMailSearchState.accountId = null
    mockMailSearchState.params = null
    mockMailSearchState.folder = null
  })

  it('does nothing outside the advanced-search route', () => {
    mockUseParams.mockReturnValue({ account: '0', folder: 'INBOX' })
    renderHook(() => useSyncAdvancedSearchFromUrl())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('hydrates the URL params into Redux on the advanced-search route', () => {
    renderHook(() => useSyncAdvancedSearchFromUrl())

    expect(mockDispatch).toHaveBeenCalledWith(
      setMailSearch({
        accountId: '0',
        params: { from: ['jane'], folders: ['all'] },
        folder: 'advanced-search',
      })
    )
  })

  it('does not dispatch again when Redux already matches the URL', () => {
    mockMailSearchState.isActive = true
    mockMailSearchState.accountId = '0'
    mockMailSearchState.folder = 'advanced-search'
    mockMailSearchState.params = { from: ['jane'], folders: ['all'] }

    renderHook(() => useSyncAdvancedSearchFromUrl())

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('re-syncs when the query string changes while staying on the route', () => {
    mockMailSearchState.isActive = true
    mockMailSearchState.accountId = '0'
    mockMailSearchState.folder = 'advanced-search'
    mockMailSearchState.params = { from: ['jane'], folders: ['all'] }

    const { rerender } = renderHook(() => useSyncAdvancedSearchFromUrl())
    expect(mockDispatch).not.toHaveBeenCalled()

    mockUseSearchParams.mockReturnValue(new URLSearchParams('from=john'))
    rerender()

    expect(mockDispatch).toHaveBeenCalledWith(
      setMailSearch({
        accountId: '0',
        params: { from: ['john'], folders: ['all'] },
        folder: 'advanced-search',
      })
    )
  })
})
