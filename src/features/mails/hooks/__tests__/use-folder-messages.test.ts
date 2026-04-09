import '@testing-library/jest-dom'
import { act, renderHook, waitFor } from '@testing-library/react'

const mockDispatch = jest.fn()
const mockSearchParams = new URLSearchParams()
const mockGetFolderMessagesQuery = jest.fn()

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => mockSearchParams),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => mockDispatch),
  useAppSelector: jest.fn((selector: (s: any) => any) =>
    selector({ mailNavigation: { skipFolderFetch: false } })
  ),
}))

jest.mock('@/features/mails/store/mail-navigation-slice', () => ({
  selectSkipFolderFetch: (state: any) => state.mailNavigation.skipFolderFetch,
  setMailNavigation: jest.fn((payload) => ({ type: 'mailNavigation/setMailNavigation', payload })),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFolderMessagesQuery: (...args: any[]) => mockGetFolderMessagesQuery(...args),
}))

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
    mockGetFolderMessagesQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
    })
  })

  describe('params construction', () => {
    it('includes default fields and fields_action params', () => {
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [args] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(args.params).toMatchObject({
        fields: 'contents',
        fields_action: 'exclude',
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
        selector({ mailNavigation: { skipFolderFetch: true } })
      )
      renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      const [, options] = mockGetFolderMessagesQuery.mock.calls[0]
      expect(options.skip).toBe(true)
    })
  })

  describe('currentPage', () => {
    it('returns 1 when no page param in URL', () => {
      const { result } = renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      expect(result.current.currentPage).toBe(1)
    })

    it('returns correct page number from URL', () => {
      mockSearchParams.set('page', '4')
      const { result } = renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      expect(result.current.currentPage).toBe(4)
    })
  })

  describe('setMailNavigation dispatch', () => {
    it('dispatches setMailNavigation when data arrives', async () => {
      const { setMailNavigation } = require('@/features/mails/store/mail-navigation-slice')
      renderHook(() => useFolderMessages({ folder: 'INBOX', accountId: '0' }))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          setMailNavigation({
            folderKey: '0/INBOX',
            orderedIds: ['1', '2'],
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

  describe('return value', () => {
    it('returns all query result fields plus currentPage and params', () => {
      const { result } = renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('isFetching')
      expect(result.current).toHaveProperty('currentPage')
      expect(result.current).toHaveProperty('params')
    })

    it('returns the constructed params object', () => {
      const { result } = renderHook(() => useFolderMessages({ folder: 'INBOX' }))
      expect(result.current.params).toMatchObject({
        fields: 'contents',
        fields_action: 'exclude',
      })
    })
  })
})
