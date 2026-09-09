import '@testing-library/jest-dom'
import { act, renderHook, waitFor } from '@testing-library/react'

const mockDispatch = jest.fn()
const mockSearchParams = new URLSearchParams()
const mockGetFolderMessagesQuery = jest.fn()
const mockSearchMailsQuery = jest.fn()
const mockMailSearchState = {
  isActive: false,
  accountId: null as string | null,
  params: null,
  folder: null as string | null,
}

const mockUsePathname = jest.fn(() => '/en/u/0/INBOX')

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => mockSearchParams),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => mockDispatch),
  useAppSelector: jest.fn((selector: (s: any) => any) =>
    selector({
      mailNavigation: { skipFolderFetch: false },
      mailSearch: mockMailSearchState,
    })
  ),
}))

jest.mock('@/features/mails/store/mail-navigation-slice', () => ({
  selectSkipFolderFetch: (state: any) => state.mailNavigation.skipFolderFetch,
  setMailNavigation: jest.fn((payload) => ({
    type: 'mailNavigation/setMailNavigation',
    payload,
  })),
}))

jest.mock('@/features/mails/store/mail-search-slice', () => ({
  clearMailSearch: jest.fn(() => ({ type: 'mailSearch/clearMailSearch' })),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFolderMessagesQuery: (...args: any[]) =>
    mockGetFolderMessagesQuery(...args),
  useSearchMailsQuery: (...args: any[]) => mockSearchMailsQuery(...args),
}))

jest.mock('../use-current-folder', () => ({
  useCurrentFolder: jest.fn(() => ({
    isSelectable: true,
    isVirtual: false,
    isLoading: false,
  })),
}))

import { useCurrentFolder } from '../use-current-folder'

import { useFolderMessages } from '../use-folder-messages'

const mockData = {
  mails: [
    { id: '1', subject: 'Test mail' },
    { id: '2', subject: 'Another mail' },
  ],
  total: 2,
  page: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

describe('useFolderMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key))
    mockUsePathname.mockReturnValue('/en/u/0/INBOX')
    mockGetFolderMessagesQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
    })
    mockSearchMailsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    })
    mockMailSearchState.isActive = false
    mockMailSearchState.accountId = null
    mockMailSearchState.params = null
    mockMailSearchState.folder = null
    ;(useCurrentFolder as jest.Mock).mockReturnValue({
      isSelectable: true,
      isVirtual: false,
      isLoading: false,
    })
    const { useAppSelector } = require('@/lib/redux/hooks')
    useAppSelector.mockImplementation((selector: (s: any) => any) =>
      selector({
        mailNavigation: { skipFolderFetch: false },
        mailSearch: mockMailSearchState,
      })
    )
  })

  describe('params construction', () => {
    it('includes default fields and fields_action params', () => {
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params).toMatchObject({
        fields: 'contents',
        fields_action: 'exclude',
        page_size: '20',
      })
    })

    it('excludes filter param from backend call', () => {
      mockSearchParams.set('filter', 'unread')
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params).not.toHaveProperty('filter')
    })

    it('includes page param when set in URL', () => {
      mockSearchParams.set('page', '3')
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params.page).toBe('3')
    })

    it('does not include sort param in final params', () => {
      mockSearchParams.set('sort', 't_desc')
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params).not.toHaveProperty('sort')
    })
  })

  describe('sort translation', () => {
    it('translates t_asc to sort_by=date sort_order=desc', () => {
      mockSearchParams.set('sort', 't_asc')
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params.sort_by).toBe('date')
      expect(args.params.sort_order).toBe('desc')
    })

    it('translates t_desc to sort_by=date sort_order=asc', () => {
      mockSearchParams.set('sort', 't_desc')
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params.sort_by).toBe('date')
      expect(args.params.sort_order).toBe('asc')
    })

    it('translates s_asc to sort_by=size sort_order=asc', () => {
      mockSearchParams.set('sort', 's_asc')
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params.sort_by).toBe('size')
      expect(args.params.sort_order).toBe('asc')
    })

    it('translates s_desc to sort_by=size sort_order=desc', () => {
      mockSearchParams.set('sort', 's_desc')
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params.sort_by).toBe('size')
      expect(args.params.sort_order).toBe('desc')
    })

    it('does not add sort params when no sort in URL', () => {
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params).not.toHaveProperty('sort_by')
      expect(args.params).not.toHaveProperty('sort_order')
    })

    it('does not add sort params for unknown sort value', () => {
      mockSearchParams.set('sort', 'unknown_value')
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params).not.toHaveProperty('sort_by')
      expect(args.params).not.toHaveProperty('sort_order')
      expect(args.params).not.toHaveProperty('sort')
    })
  })

  describe('RTK Query call args', () => {
    it('passes folder to the query', () => {
      renderHook(() => useFolderMessages({ folder: 'Sent' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.folder).toBe('Sent')
    })

    it('normalizes missing accountId to "0"', () => {
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.accountId).toBe('0')
    })

    it('passes provided accountId', () => {
      renderHook(() => useFolderMessages({ folder: 'INBOX', accountId: '42' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.accountId).toBe('42')
    })

    it('skips query when skipFolderFetch is true', () => {
      const { useAppSelector } = require('@/lib/redux/hooks')
      useAppSelector.mockImplementation((selector: (s: any) => any) =>
        selector({
          mailNavigation: { skipFolderFetch: true },
          mailSearch: mockMailSearchState,
        })
      )
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [, options] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(options.skip).toBe(true)
    })
  })

  describe('currentPage', () => {
    it('returns 1 when no page param in URL', () => {
      const { result } = renderHook(() =>
        useFolderMessages({ folder: 'INBOX' })
      )
      expect(result.current.currentPage).toBe(1)
    })

    it('returns correct page number from URL', () => {
      mockSearchParams.set('page', '4')
      const { result } = renderHook(() =>
        useFolderMessages({ folder: 'INBOX' })
      )
      expect(result.current.currentPage).toBe(4)
    })
  })

  describe('setMailNavigation dispatch', () => {
    it('dispatches setMailNavigation when data arrives', async () => {
      const {
        setMailNavigation,
      } = require('@/features/mails/store/mail-navigation-slice')
      renderHook(() => useFolderMessages({ folder: 'INBOX', accountId: '0' }))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          setMailNavigation({
            folderKey: '0/INBOX',
            orderedIds: ['1', '2'],
            folderById: { '1': 'INBOX', '2': 'INBOX' },
            page: 1,
            totalPages: 1,
          })
        )
      })
    })

    it('does not dispatch when data has no mails', async () => {
      mockGetFolderMessagesQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: true,
      })
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      await act(async () => {})
      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('virtual folders', () => {
    it('skips folder messages query when folder is not selectable', () => {
      ;(useCurrentFolder as jest.Mock).mockReturnValue({
        isSelectable: false,
        isVirtual: true,
        isLoading: false,
      })
      renderHook(() => useFolderMessages({ folder: 'Virtual' }))
      const [, options] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(options.skip).toBe(true)
    })
  })

  describe('return value', () => {
    it('returns all query result fields plus currentPage and params', () => {
      const { result } = renderHook(() =>
        useFolderMessages({ folder: 'INBOX' })
      )
      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('isFetching')
      expect(result.current).toHaveProperty('currentPage')
      expect(result.current).toHaveProperty('params')
    })

    it('returns the constructed params object', () => {
      const { result } = renderHook(() =>
        useFolderMessages({ folder: 'INBOX' })
      )
      expect(result.current.params).toMatchObject({
        fields: 'contents',
        fields_action: 'exclude',
      })
    })
  })

  describe('search mode', () => {
    it('skips the folder query and uses search results when a search is active for this account', () => {
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' } as any
      mockSearchMailsQuery.mockReturnValue({
        data: mockData,
        isLoading: false,
        isFetching: false,
      })

      const { result } = renderHook(() =>
        useFolderMessages({ folder: 'INBOX' })
      )

      const [, folderOptions] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(folderOptions.skip).toBe(true)
      const [searchArgs, searchOptions] = mockSearchMailsQuery.mock.calls[0]
      expect(searchArgs).toEqual({
        accountId: '0',
        body: { text: 'invoice' },
        params: { page: 1, page_size: '20' },
      })
      expect(searchOptions.skip).toBe(false)
      expect(result.current.data).toBe(mockData)
      expect(result.current.isSearchActive).toBe(true)
      expect(result.current.isVirtualFolder).toBe(false)
    })

    it('ignores an active search from a different account', () => {
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '1'
      mockMailSearchState.params = { text: 'invoice' } as any

      renderHook(() => useFolderMessages({ folder: 'INBOX', accountId: '0' }))

      const [, folderOptions] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(folderOptions.skip).toBe(false)
      const [, searchOptions] = mockSearchMailsQuery.mock.calls[0]
      expect(searchOptions.skip).toBe(true)
    })

    it('clears the search when navigating to a different folder', () => {
      const {
        clearMailSearch,
      } = require('@/features/mails/store/mail-search-slice')
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' } as any
      mockMailSearchState.folder = 'INBOX'

      const { rerender } = renderHook(
        ({ folder }) => useFolderMessages({ folder, accountId: '0' }),
        { initialProps: { folder: 'INBOX' } }
      )
      expect(mockDispatch).not.toHaveBeenCalledWith(clearMailSearch())

      rerender({ folder: 'Archive' })
      expect(mockDispatch).toHaveBeenCalledWith(clearMailSearch())
    })

    it('regression: does not clear the search when opening a cross-folder search result (mail_id in the path)', () => {
      // Opening a result that actually lives in 'Archive' (search was
      // launched from 'INBOX') navigates the route's folder to 'Archive',
      // but the user only drilled into one mail — they haven't left search.
      const {
        clearMailSearch,
      } = require('@/features/mails/store/mail-search-slice')
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' } as any
      mockMailSearchState.folder = 'INBOX'
      mockUsePathname.mockReturnValue('/en/u/0/Archive/42')

      renderHook(() => useFolderMessages({ folder: 'Archive', accountId: '0' }))

      expect(mockDispatch).not.toHaveBeenCalledWith(clearMailSearch())
    })

    it("regression: still clears the search when navigating to that folder's own list afterward", () => {
      // Closing the mail (no more mail_id in the path) while still routed
      // at 'Archive' is a genuine folder-list navigation away from search.
      const {
        clearMailSearch,
      } = require('@/features/mails/store/mail-search-slice')
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' } as any
      mockMailSearchState.folder = 'INBOX'
      mockUsePathname.mockReturnValue('/en/u/0/Archive/42')

      const { rerender } = renderHook(() =>
        useFolderMessages({ folder: 'Archive', accountId: '0' })
      )
      expect(mockDispatch).not.toHaveBeenCalledWith(clearMailSearch())

      mockUsePathname.mockReturnValue('/en/u/0/Archive')
      rerender()
      expect(mockDispatch).toHaveBeenCalledWith(clearMailSearch())
    })

    it('regression: keeps the navigation folderKey/folderById on the search origin folder while viewing a cross-folder result', async () => {
      const {
        setMailNavigation,
      } = require('@/features/mails/store/mail-navigation-slice')
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' } as any
      mockMailSearchState.folder = 'INBOX'
      mockUsePathname.mockReturnValue('/en/u/0/Archive/42')
      mockSearchMailsQuery.mockReturnValue({
        data: mockData,
        isLoading: false,
        isFetching: false,
      })

      renderHook(() => useFolderMessages({ folder: 'Archive', accountId: '0' }))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          setMailNavigation(expect.objectContaining({ folderKey: '0/INBOX' }))
        )
      })
    })

    it('clears the search on first mount when it was activated from a different folder', () => {
      // Regression test: this hook is called from page-level components,
      // which Next.js remounts on every navigation (unlike layouts). A
      // component-local "previous folder" ref would always initialize to
      // the new folder on such a remount and never detect the navigation —
      // the fix tracks the search's origin folder in Redux instead, which
      // survives the remount.
      const {
        clearMailSearch,
      } = require('@/features/mails/store/mail-search-slice')
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' } as any
      mockMailSearchState.folder = 'INBOX'

      renderHook(() => useFolderMessages({ folder: 'Archive', accountId: '0' }))

      expect(mockDispatch).toHaveBeenCalledWith(clearMailSearch())
    })

    it('does not clear the search on mount when it was activated from the same folder', () => {
      const {
        clearMailSearch,
      } = require('@/features/mails/store/mail-search-slice')
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' } as any
      mockMailSearchState.folder = 'INBOX'

      renderHook(() => useFolderMessages({ folder: 'INBOX', accountId: '0' }))

      expect(mockDispatch).not.toHaveBeenCalledWith(clearMailSearch())
    })

    it('clears a stale search when switching to a different account', () => {
      // Regression test: `isSearchActive` already requires a matching
      // accountId, so gating the clear-effect on it (instead of on
      // `mailSearch.isActive` directly) meant switching accounts never
      // cleared the previous account's search — it would silently
      // resurrect when navigating back to the original account/folder.
      const {
        clearMailSearch,
      } = require('@/features/mails/store/mail-search-slice')
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' } as any
      mockMailSearchState.folder = 'INBOX'

      renderHook(() => useFolderMessages({ folder: 'INBOX', accountId: '1' }))

      expect(mockDispatch).toHaveBeenCalledWith(clearMailSearch())
    })

    it('skips the folder query on the advanced-search pseudo-folder even before the search is synced from the URL', () => {
      // The advanced-search route never corresponds to a real IMAP folder;
      // it must never be queried as one, even for the brief render before
      // useSyncAdvancedSearchFromUrl dispatches the search into Redux.
      renderHook(() =>
        useFolderMessages({ folder: 'advanced-search', accountId: '0' })
      )
      const [, folderOptions] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(folderOptions.skip).toBe(true)
    })

    it('does not clear the search while on the advanced-search route, even across a folder-key rerender', () => {
      // On this route, `mailSearch` is owned by useSyncAdvancedSearchFromUrl
      // (driven by the URL), not by this hook's clear-on-folder-change logic.
      const {
        clearMailSearch,
      } = require('@/features/mails/store/mail-search-slice')
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { from: 'jane' } as any
      mockMailSearchState.folder = 'advanced-search'

      const { rerender } = renderHook(
        ({ folder }) => useFolderMessages({ folder, accountId: '0' }),
        { initialProps: { folder: 'advanced-search' } }
      )
      rerender({ folder: 'advanced-search' })

      expect(mockDispatch).not.toHaveBeenCalledWith(clearMailSearch())
    })

    it('keeps isVirtualFolder truthful while a search is active', () => {
      ;(useCurrentFolder as jest.Mock).mockReturnValue({
        isSelectable: false,
        isVirtual: true,
        isLoading: false,
      })
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' } as any

      const { result } = renderHook(() =>
        useFolderMessages({ folder: 'Virtual', accountId: '0' })
      )

      expect(result.current.isVirtualFolder).toBe(true)
      expect(result.current.isSearchActive).toBe(true)
    })
  })
})
