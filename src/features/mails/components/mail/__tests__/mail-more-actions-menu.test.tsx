import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailMoreActionsMenu from '../mail-more-actions-menu'

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode
    asChild?: boolean
  }) => (
    <div data-testid="dropdown-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button
      type="button"
      data-testid="dropdown-item"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  DropdownMenuSub: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-sub">{children}</div>
  ),
  DropdownMenuSubTrigger: ({
    children,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    'data-testid'?: string
  }) => <div data-testid={testId}>{children}</div>,
  DropdownMenuSubContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-sub-content">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(() => ({ data: [] })),
}))

describe('MailMoreActionsMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders the more actions trigger button', () => {
      render(<MailMoreActionsMenu />)
      expect(
        screen.getByTestId('mail-action-btn-more-actions')
      ).toBeInTheDocument()
    })

    it('renders dropdown structure', () => {
      render(<MailMoreActionsMenu onMarkUnread={jest.fn()} />)
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('disables trigger when disabled prop is true', () => {
      render(<MailMoreActionsMenu disabled />)
      expect(screen.getByTestId('mail-action-btn-more-actions')).toBeDisabled()
    })

    it('shows report spam action when not in junk folder', () => {
      const onMarkSpam = jest.fn()
      render(
        <MailMoreActionsMenu
          isJunk={false}
          showSpamActions
          onMarkSpam={onMarkSpam}
        />
      )
      expect(screen.getByText('report_spam.string')).toBeInTheDocument()
      fireEvent.click(screen.getByText('report_spam.string'))
      expect(onMarkSpam).toHaveBeenCalledTimes(1)
    })

    it('shows move to inbox action when in junk folder', () => {
      const onMarkHam = jest.fn()
      render(
        <MailMoreActionsMenu isJunk showSpamActions onMarkHam={onMarkHam} />
      )
      expect(screen.getByText('report_not_spam.string')).toBeInTheDocument()
      fireEvent.click(screen.getByText('report_not_spam.string'))
      expect(onMarkHam).toHaveBeenCalledTimes(1)
    })

    it('renders folder-specific actions and calls onFolderSpecificAction on click', () => {
      const onFolderSpecificAction = jest.fn()
      render(
        <MailMoreActionsMenu
          folderSpecificActions={[
            { id: 'edit-draft', icon: <span />, title: 'edit_draft.string' },
            {
              id: 'use-template',
              icon: <span />,
              title: 'use_template.string',
            },
          ]}
          onFolderSpecificAction={onFolderSpecificAction}
        />
      )
      expect(screen.getByText('edit_draft.string')).toBeInTheDocument()
      expect(screen.getByText('use_template.string')).toBeInTheDocument()

      fireEvent.click(screen.getByText('edit_draft.string'))
      expect(onFolderSpecificAction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'edit-draft' })
      )
    })

    it('shows optional actions when enabled', () => {
      const handlers = {
        onMarkUnread: jest.fn(),
        onLabel: jest.fn(),
        onArchive: jest.fn(),
        onDownload: jest.fn(),
        onSelectDestination: jest.fn(),
        onCreateFolder: jest.fn(),
        onPrint: jest.fn(),
        onViewSource: jest.fn(),
      }
      render(
        <MailMoreActionsMenu
          {...handlers}
          showUnread
          showLabel
          showArchive
          showDownload
          showMoveCopy
          showPrint
          showViewSource
        />
      )
      expect(screen.getByText('mark_unread.string')).toBeInTheDocument()
      expect(screen.getByText('label.string')).toBeInTheDocument()
      expect(screen.getByText('archive.string')).toBeInTheDocument()
      expect(screen.getByText('download.string')).toBeInTheDocument()
      expect(screen.getByText('move.string')).toBeInTheDocument()
      expect(screen.getByText('copy.string')).toBeInTheDocument()
      expect(screen.getByText('print.string')).toBeInTheDocument()
      expect(screen.getByText('view_source.string')).toBeInTheDocument()
    })

    it('calls onSelectDestination and onCreateFolder from the move/copy submenus', () => {
      const onSelectDestination = jest.fn()
      const onCreateFolder = jest.fn()
      render(
        <MailMoreActionsMenu
          showMoveCopy
          accountId="0"
          currentFolder="INBOX"
          onSelectDestination={onSelectDestination}
          onCreateFolder={onCreateFolder}
        />
      )
      expect(
        screen.getByTestId('mail-action-more-move-submenu')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('mail-action-more-copy-submenu')
      ).toBeInTheDocument()

      const newFolderItems = screen.getAllByText(
        'move_dialog.new_folder.string'
      )
      fireEvent.click(newFolderItems[0])
      expect(onCreateFolder).toHaveBeenCalledWith('move')
      fireEvent.click(newFolderItems[1])
      expect(onCreateFolder).toHaveBeenCalledWith('copy')
    })

    it('does not show move/copy submenus when showMoveCopy is false', () => {
      render(
        <MailMoreActionsMenu
          onSelectDestination={jest.fn()}
          onCreateFolder={jest.fn()}
        />
      )
      expect(screen.queryByText('move.string')).not.toBeInTheDocument()
      expect(screen.queryByText('copy.string')).not.toBeInTheDocument()
    })

    it('hides actions when show flags are false', () => {
      render(
        <MailMoreActionsMenu
          onMarkUnread={jest.fn()}
          showUnread={false}
          showSpamActions={false}
        />
      )
      expect(screen.queryByText('mark_unread.string')).not.toBeInTheDocument()
      expect(screen.queryByText('report_spam.string')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('sets aria-label on trigger button', () => {
      render(<MailMoreActionsMenu />)
      expect(
        screen.getByTestId('mail-action-btn-more-actions')
      ).toHaveAttribute('aria-label', 'more.string')
    })

    it('disables mark unread item when markUnreadDisabled is true', () => {
      render(
        <MailMoreActionsMenu
          onMarkUnread={jest.fn()}
          showUnread
          markUnreadDisabled
        />
      )
      const unreadButton = screen.getByText('mark_unread.string')
      expect(unreadButton).toBeDisabled()
    })
  })

  describe('custom styling', () => {
    it('applies triggerClassName to the trigger button', () => {
      render(<MailMoreActionsMenu triggerClassName="custom-trigger" />)
      expect(screen.getByTestId('mail-action-btn-more-actions')).toHaveClass(
        'custom-trigger'
      )
    })
  })
})
