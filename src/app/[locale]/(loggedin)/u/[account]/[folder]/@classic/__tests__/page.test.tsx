import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Page from '../page'

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn(() => false),
}))

jest.mock('@/features/mails/store/mail-navigation-slice', () => ({
  selectSkipFolderFetch: (s: any) =>
    s?.mailNavigation?.skipFolderFetch ?? false,
  selectIsManualRefresh: (s: any) =>
    (s?.mailNavigation?.manualRefreshId ?? null) !== null,
  selectMailNavigationFolderKey: (s: any) =>
    s?.mailNavigation?.folderKey ?? null,
  manualRefreshStarted: jest.fn(() => ({ type: 'manualRefreshStarted' })),
  manualRefreshEnded: jest.fn(() => ({ type: 'manualRefreshEnded' })),
  setMailNavigation: jest.fn((p) => ({
    type: 'mailNavigation/setMailNavigation',
    payload: p,
  })),
}))

jest.mock('@/lib/redux/api/api-slice', () => ({
  MAILS_FOLDERS_SLICE: 'mails/folders',
  apiSlice: { util: { invalidateTags: jest.fn() } },
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFolderMessagesQuery: jest.fn(),
  useGetFoldersQuery: jest.fn(() => ({ data: [], isLoading: false })),
  useSearchMailsQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
}))

jest.mock('@/features/offline/hooks/use-offline-mail-list', () => ({
  useOfflineMailList: () => ({ cachedMails: null, isShowingCache: false }),
}))

jest.mock('@/features/offline/offline-nav-context', () => ({
  useOfflineNav: () => ({
    view: { kind: 'route' },
    folderPathOverride: null,
    openFolder: jest.fn(),
    openOutbox: jest.fn(),
    clearUnavailable: jest.fn(),
  }),
}))

jest.mock('@/features/mails/components/list', () => ({
  __esModule: true,
  default: ({
    items,
    type,
    hideToolbar,
  }: {
    items: unknown[]
    type?: string
    hideToolbar?: boolean
  }) => (
    <div
      data-testid="messages-list"
      data-type={type}
      data-hide-toolbar={String(hideToolbar)}
    >
      <span data-testid="items-count">{items.length}</span>
    </div>
  ),
}))

jest.mock('@/features/mails/components/skeletons/list-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="list-skeleton">Loading...</div>,
}))

describe('Classic Page', () => {
  const mockUseParams = require('next/navigation').useParams as jest.Mock
  const mockUseSearchParams = require('next/navigation')
    .useSearchParams as jest.Mock
  const mockUseSelector = require('react-redux').useSelector as jest.Mock
  const mockUseGetFolderMessagesQuery =
    require('@/features/mails/store/mails-api')
      .useGetFolderMessagesQuery as jest.Mock
  const mockUseSearchMailsQuery = require('@/features/mails/store/mails-api')
    .useSearchMailsQuery as jest.Mock
  const mockUseAppSelector = require('@/lib/redux/hooks')
    .useAppSelector as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppSelector.mockImplementation(() => false)
    mockUseSearchMailsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    })
    mockUseParams.mockReturnValue({ folder: 'INBOX', mail_id: undefined })
    mockUseSearchParams.mockReturnValue(
      Object.assign(new URLSearchParams(), { get: (k: string) => null })
    )
    mockUseSelector.mockReturnValue('split')
    mockUseGetFolderMessagesQuery.mockReturnValue({
      data: {
        mails: [],
        page: 1,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isFetching: false,
    })
  })

  describe('basic rendering', () => {
    it('renders MessagesList with classic type and hideToolbar', () => {
      render(<Page />)
      const list = screen.getByTestId('messages-list')
      expect(list).toBeInTheDocument()
      expect(list).toHaveAttribute('data-type', 'classic')
      expect(list).toHaveAttribute('data-hide-toolbar', 'true')
    })

    it('shows ListSkeleton when fetching', () => {
      mockUseGetFolderMessagesQuery.mockReturnValue({
        data: undefined,
        isFetching: true,
      })
      render(<Page />)
      expect(screen.getByTestId('list-skeleton')).toBeInTheDocument()
    })
  })

  it('shows ListSkeleton instead of the previous page while a new page loads', () => {
    mockUseGetFolderMessagesQuery.mockReturnValue({
      data: { mails: [{ id: 1 }], page: 1, total: 1, totalPages: 2 },
      currentData: undefined,
      isFetching: true,
    })
    render(<Page />)
    expect(screen.getByTestId('list-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('messages-list')).not.toBeInTheDocument()
  })

  describe('integration', () => {
    // Folder lists are filtered by the server: the page sends the quick
    // filter with the request and shows the returned mails as they are.
    it('sends the quick filter to the server for folder lists', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('filter', 'attachments')
      mockUseSearchParams.mockReturnValue(searchParams)
      mockUseGetFolderMessagesQuery.mockReturnValue({
        data: {
          mails: [
            {
              id: 1,
              hasAttachment: true,
              seen: true,
              flagged: false,
              date: '2024-01-01',
              size: 100,
            },
            {
              id: 2,
              hasAttachment: true,
              seen: true,
              flagged: false,
              date: '2024-01-02',
              size: 200,
            },
          ],
          page: 1,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        isFetching: false,
      })
      render(<Page />)
      expect(mockUseGetFolderMessagesQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ filter: 'attachments' }),
        }),
        expect.anything()
      )
      await waitFor(() => {
        expect(screen.getByTestId('items-count')).toHaveTextContent('2')
      })
    })

    // Search results cannot be filtered by the server: the page filters them.
    it('filters search results on the client', async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('filter', 'unread')
      mockUseSearchParams.mockReturnValue(searchParams)
      mockUseAppSelector.mockImplementation(
        (selector: (state: unknown) => unknown) =>
          selector({
            mailSearch: {
              isActive: true,
              accountId: '0',
              folder: 'INBOX',
              params: {},
            },
            mailNavigation: { skipFolderFetch: false, manualRefreshId: null },
          })
      )
      mockUseSearchMailsQuery.mockReturnValue({
        data: {
          mails: [
            {
              id: 1,
              hasAttachment: false,
              seen: false,
              flagged: false,
              date: '2024-01-01',
              size: 100,
            },
            {
              id: 2,
              hasAttachment: false,
              seen: true,
              flagged: false,
              date: '2024-01-02',
              size: 200,
            },
          ],
          page: 1,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        isFetching: false,
      })
      render(<Page />)
      await waitFor(() => {
        expect(screen.getByTestId('items-count')).toHaveTextContent('1')
      })
    })

    it('handles array folder param', () => {
      mockUseParams.mockReturnValue({
        folder: ['Archive', 'Old'],
        mail_id: undefined,
      })
      render(<Page />)
      expect(mockUseGetFolderMessagesQuery).toHaveBeenCalledWith(
        expect.objectContaining({ folder: 'Archive/Old' }),
        expect.anything()
      )
    })
  })
})
