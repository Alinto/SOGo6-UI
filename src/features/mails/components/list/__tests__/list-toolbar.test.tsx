import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ListToolbar from '../list-toolbar'

const mockBatchDelete = jest.fn().mockResolvedValue(undefined)
const mockBatchArchive = jest.fn().mockResolvedValue(undefined)
const mockBatchMarkRead = jest.fn().mockResolvedValue(undefined)
const mockBatchMarkUnread = jest.fn().mockResolvedValue(undefined)
const mockBatchSpam = jest.fn().mockResolvedValue(undefined)
const mockBatchHam = jest.fn().mockResolvedValue(undefined)
const mockBatchMove = jest.fn().mockResolvedValue(undefined)
const mockBatchCopy = jest.fn().mockResolvedValue(undefined)
const mockBatchApplyLabels = jest.fn().mockResolvedValue(undefined)
const mockBatchRemoveLabels = jest.fn().mockResolvedValue(undefined)
const mockUseMailBatchActions = jest.fn(() => ({
  batchDelete: mockBatchDelete,
  batchArchive: mockBatchArchive,
  batchMarkRead: mockBatchMarkRead,
  batchMarkUnread: mockBatchMarkUnread,
  batchSpam: mockBatchSpam,
  batchHam: mockBatchHam,
  batchMove: mockBatchMove,
  batchCopy: mockBatchCopy,
  batchApplyLabels: mockBatchApplyLabels,
  batchRemoveLabels: mockBatchRemoveLabels,
  isJunk: false,
  isLoading: false,
}))

jest.mock('@/features/mails/hooks/use-mail-batch-actions', () => ({
  useMailBatchActions: () => mockUseMailBatchActions(),
}))

jest.mock('@/features/mails/hooks/use-folder-messages', () => ({
  useFolderMessages: jest.fn(() => ({
    data: {
      mails: [
        { id: '1', subject: 'Test', seen: false },
        { id: '2', subject: 'Test 2', seen: true },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
    currentPage: 1,
    params: {},
  })),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFolderMessagesQuery: jest.fn(() => ({
    data: {
      mails: [
        { id: '1', subject: 'Test' },
        { id: '2', subject: 'Test 2' },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
  })),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ folder: 'INBOX', account: '0' })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => mockDispatch),
  useAppSelector: jest.fn((fn: any) =>
    fn({
      mailLayout: { selectedMailIds: [] },
      mailNavigation: { skipFolderFetch: false },
    })
  ),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      data-testid="checkbox"
      type="checkbox"
      checked={checked === true}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}))

jest.mock('@/features/mails/components/mail/mail-action-bar', () => ({
  __esModule: true,
  default: ({ actions, onAction, children }: any) => (
    <div data-testid="mail-actions-bar">
      {actions.map((action: any, idx: number) => (
        <button
          key={action.id ?? idx}
          data-testid={`mock-bulk-action-${action.id}`}
          disabled={action.disabled}
          onClick={() => onAction?.(idx, action)}
        >
          {action.title}
        </button>
      ))}
      {children}
    </div>
  ),
}))

jest.mock(
  '@/features/mails/components/mail/mail-bulk-label-picker-dialog',
  () => ({
    __esModule: true,
    default: ({ open, onApplyLabels, onRemoveLabels }: any) =>
      open ? (
        <>
          <button
            data-testid="mock-bulk-label-apply"
            onClick={() => void onApplyLabels(['Work'])}
          >
            bulk-label-dialog
          </button>
          <button
            data-testid="mock-bulk-label-remove"
            onClick={() => void onRemoveLabels(['Work'])}
          >
            bulk-label-dialog-remove
          </button>
        </>
      ) : null,
  })
)

jest.mock('@/features/mails/components/mail/mail-move-dialog', () => ({
  __esModule: true,
  default: ({ open, mode }: any) =>
    open ? <div data-testid={`mock-bulk-move-dialog-${mode}`} /> : null,
}))

jest.mock('@/features/mails/components/mail/mail-move-copy-menu', () => ({
  __esModule: true,
  default: ({ onSelectDestination }: any) => (
    <div data-testid="mail-move-copy-menu">
      <button
        data-testid="mock-bulk-move-archive"
        onClick={() => onSelectDestination('move', 'Archive')}
      >
        move-archive
      </button>
      <button
        data-testid="mock-bulk-copy-archive"
        onClick={() => onSelectDestination('copy', 'Archive')}
      >
        copy-archive
      </button>
    </div>
  ),
}))

jest.mock('../list-filter', () => ({
  __esModule: true,
  default: () => <div data-testid="list-filter" />,
}))

jest.mock('../list-filter-dropdown', () => ({
  __esModule: true,
  default: () => <div data-testid="list-filter-dropdown" />,
}))

jest.mock('../list-sort', () => ({
  __esModule: true,
  default: () => <div data-testid="list-sort" />,
}))

jest.mock('../list-pagination', () => ({
  __esModule: true,
  default: () => <div data-testid="list-pagination" />,
}))

jest.mock('@/features/mails/components/mail/mail-detail-navigation', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-detail-navigation" />,
}))

jest.mock('@/features/mails/hooks/use-list-toolbar-mode', () => ({
  useListToolbarMode: jest.fn(() => 'list'),
}))

const mockUseAppSelector = jest.fn((fn: (s: any) => any) =>
  fn({
    mailLayout: { selectedMailIds: [] },
    mailNavigation: { skipFolderFetch: false },
  })
)

describe('ListToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBatchDelete.mockResolvedValue(undefined)
    mockBatchArchive.mockResolvedValue(undefined)
    mockBatchMarkRead.mockResolvedValue(undefined)
    mockBatchMarkUnread.mockResolvedValue(undefined)
    mockBatchSpam.mockResolvedValue(undefined)
    mockBatchHam.mockResolvedValue(undefined)
    mockBatchMove.mockResolvedValue(undefined)
    mockBatchCopy.mockResolvedValue(undefined)
    mockBatchApplyLabels.mockResolvedValue(undefined)
    mockBatchRemoveLabels.mockResolvedValue(undefined)
    mockUseMailBatchActions.mockReturnValue({
      batchDelete: mockBatchDelete,
      batchArchive: mockBatchArchive,
      batchMarkRead: mockBatchMarkRead,
      batchMarkUnread: mockBatchMarkUnread,
      batchSpam: mockBatchSpam,
      batchHam: mockBatchHam,
      batchMove: mockBatchMove,
      batchCopy: mockBatchCopy,
      batchApplyLabels: mockBatchApplyLabels,
      batchRemoveLabels: mockBatchRemoveLabels,
      isJunk: false,
      isLoading: false,
    })
    const { useAppSelector } = require('@/lib/redux/hooks')
    useAppSelector.mockImplementation(mockUseAppSelector)
  })

  describe('basic rendering', () => {
    it('renders folder title and message count when no selection', () => {
      render(<ListToolbar />)
      expect(screen.getByText('folders.inbox.string')).toBeInTheDocument()
      expect(screen.getByText('messages_number.string')).toBeInTheDocument()
    })

    it('renders ListFilter when not mobile', () => {
      render(<ListToolbar />)
      expect(screen.getByTestId('list-filter')).toBeInTheDocument()
    })

    it('renders ListSort when not mobile', () => {
      render(<ListToolbar />)
      expect(screen.getByTestId('list-sort')).toBeInTheDocument()
    })

    it('renders ListPagination', () => {
      render(<ListToolbar />)
      expect(screen.getByTestId('list-pagination')).toBeInTheDocument()
    })

    it('renders ListPagination when a client-side URL filter is active', () => {
      const { useSearchParams } = require('next/navigation')
      useSearchParams.mockReturnValue(new URLSearchParams('filter=unread'))
      render(<ListToolbar />)
      expect(screen.getByTestId('list-pagination')).toBeInTheDocument()
    })

    it('renders checkbox', () => {
      render(<ListToolbar />)
      expect(screen.getByTestId('checkbox')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('shows MailActionsBar when items selected', () => {
      const { useAppSelector } = require('@/lib/redux/hooks')
      useAppSelector.mockImplementation((fn: (s: any) => any) =>
        fn({
          mailLayout: { selectedMailIds: ['1'] },
          mailNavigation: { skipFolderFetch: false },
        })
      )
      render(<ListToolbar />)
      expect(screen.getByTestId('mail-actions-bar')).toBeInTheDocument()
    })

    it('handles array folder param', () => {
      const { useParams } = require('next/navigation')
      useParams.mockReturnValue({ folder: ['Archive', 'Old'] })
      render(<ListToolbar />)
      expect(screen.getByText('Old')).toBeInTheDocument()
    })

    it('shows subfolder name for encoded nested paths', () => {
      const { useParams } = require('next/navigation')
      useParams.mockReturnValue({ folder: 'INBOX%2Fnewsub', account: '0' })
      render(<ListToolbar />)
      expect(screen.getByText('newsub')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('has border-b and flex layout', () => {
      const { container } = render(<ListToolbar />)
      const root = container.firstChild as HTMLElement
      expect(root).toHaveClass('border-b', 'flex')
    })
  })

  describe('mail detail view', () => {
    it('shows mail navigation instead of list controls on mobile', () => {
      const {
        useListToolbarMode,
      } = require('@/features/mails/hooks/use-list-toolbar-mode')
      useListToolbarMode.mockReturnValue('detail-navigation')

      render(<ListToolbar />)

      expect(screen.getByTestId('mail-detail-navigation')).toBeInTheDocument()
      expect(screen.queryByTestId('list-pagination')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('list-filter-dropdown')
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('checkbox')).not.toBeInTheDocument()
    })

    it('renders nothing on desktop full-screen mail detail', () => {
      const {
        useListToolbarMode,
      } = require('@/features/mails/hooks/use-list-toolbar-mode')
      useListToolbarMode.mockReturnValue('hidden')

      const { container } = render(<ListToolbar />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('bulk actions', () => {
    beforeEach(() => {
      const {
        useListToolbarMode,
      } = require('@/features/mails/hooks/use-list-toolbar-mode')
      useListToolbarMode.mockReturnValue('list')
      const { useAppSelector } = require('@/lib/redux/hooks')
      useAppSelector.mockImplementation((fn: any) =>
        fn({
          mailLayout: { selectedMailIds: ['1', '2'] },
          mailNavigation: { skipFolderFetch: false },
        })
      )
      const { useSearchParams } = require('next/navigation')
      useSearchParams.mockReturnValue(new URLSearchParams())
    })

    it('calls batchDelete with the selected ids and clears the selection', async () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-action-bulk-delete'))
      await waitFor(() =>
        expect(mockBatchDelete).toHaveBeenCalledWith(['1', '2'])
      )
      expect(mockDispatch).toHaveBeenCalled()
    })

    it('calls batchArchive with the selected ids', async () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-action-bulk-archive'))
      await waitFor(() =>
        expect(mockBatchArchive).toHaveBeenCalledWith(['1', '2'])
      )
    })

    it('only marks unseen selected mails as read', async () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-action-bulk-mark-read'))
      await waitFor(() => expect(mockBatchMarkRead).toHaveBeenCalledWith(['1']))
    })

    it('only marks seen selected mails as unread', async () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-action-bulk-mark-unread'))
      await waitFor(() =>
        expect(mockBatchMarkUnread).toHaveBeenCalledWith(['2'])
      )
    })

    it('disables mark-as-read when only read mails are selected', () => {
      const { useAppSelector } = require('@/lib/redux/hooks')
      useAppSelector.mockImplementation((fn: any) =>
        fn({
          mailLayout: { selectedMailIds: ['2'] },
          mailNavigation: { skipFolderFetch: false },
        })
      )
      render(<ListToolbar />)
      expect(
        screen.getByTestId('mock-bulk-action-bulk-mark-read')
      ).toBeDisabled()
      expect(
        screen.getByTestId('mock-bulk-action-bulk-mark-unread')
      ).not.toBeDisabled()
    })

    it('disables mark-as-unread when only unread mails are selected', () => {
      const { useAppSelector } = require('@/lib/redux/hooks')
      useAppSelector.mockImplementation((fn: any) =>
        fn({
          mailLayout: { selectedMailIds: ['1'] },
          mailNavigation: { skipFolderFetch: false },
        })
      )
      render(<ListToolbar />)
      expect(
        screen.getByTestId('mock-bulk-action-bulk-mark-read')
      ).not.toBeDisabled()
      expect(
        screen.getByTestId('mock-bulk-action-bulk-mark-unread')
      ).toBeDisabled()
    })

    it('calls batchSpam when not in a junk folder', async () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-action-bulk-spam'))
      await waitFor(() =>
        expect(mockBatchSpam).toHaveBeenCalledWith(['1', '2'])
      )
    })

    it('calls batchHam when in a junk folder', async () => {
      mockUseMailBatchActions.mockReturnValue({
        batchDelete: mockBatchDelete,
        batchArchive: mockBatchArchive,
        batchMarkRead: mockBatchMarkRead,
        batchMarkUnread: mockBatchMarkUnread,
        batchSpam: mockBatchSpam,
        batchHam: mockBatchHam,
        batchMove: mockBatchMove,
        batchCopy: mockBatchCopy,
        batchApplyLabels: mockBatchApplyLabels,
        batchRemoveLabels: mockBatchRemoveLabels,
        isJunk: true,
        isLoading: false,
      })
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-action-bulk-spam'))
      await waitFor(() => expect(mockBatchHam).toHaveBeenCalledWith(['1', '2']))
    })

    it('opens the bulk label dialog without clearing the selection first', () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-action-bulk-label'))
      expect(screen.getByTestId('mock-bulk-label-apply')).toBeInTheDocument()
      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('applies bulk labels through the picker dialog', async () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-action-bulk-label'))
      fireEvent.click(screen.getByTestId('mock-bulk-label-apply'))
      await waitFor(() =>
        expect(mockBatchApplyLabels).toHaveBeenCalledWith(['1', '2'], ['Work'])
      )
    })

    it('removes bulk labels through the picker dialog', async () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-action-bulk-label'))
      fireEvent.click(screen.getByTestId('mock-bulk-label-remove'))
      await waitFor(() =>
        expect(mockBatchRemoveLabels).toHaveBeenCalledWith(['1', '2'], ['Work'])
      )
    })

    it('moves selected mails to the chosen destination', async () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-move-archive'))
      await waitFor(() =>
        expect(mockBatchMove).toHaveBeenCalledWith(['1', '2'], 'Archive')
      )
    })

    it('copies selected mails to the chosen destination', async () => {
      render(<ListToolbar />)
      fireEvent.click(screen.getByTestId('mock-bulk-copy-archive'))
      await waitFor(() =>
        expect(mockBatchCopy).toHaveBeenCalledWith(['1', '2'], 'Archive')
      )
    })
  })
})
