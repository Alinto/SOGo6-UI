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
        <MailMoreActionsMenu isJunk={false} onMarkSpam={onMarkSpam} />
      )
      expect(screen.getByText('report_spam.string')).toBeInTheDocument()
      fireEvent.click(screen.getByText('report_spam.string'))
      expect(onMarkSpam).toHaveBeenCalledTimes(1)
    })

    it('shows move to inbox action when in junk folder', () => {
      const onMarkHam = jest.fn()
      render(<MailMoreActionsMenu isJunk onMarkHam={onMarkHam} />)
      expect(screen.getByText('move_to_inbox.string')).toBeInTheDocument()
      fireEvent.click(screen.getByText('move_to_inbox.string'))
      expect(onMarkHam).toHaveBeenCalledTimes(1)
    })

    it('shows optional actions when enabled', () => {
      const handlers = {
        onMarkUnread: jest.fn(),
        onLabel: jest.fn(),
        onArchive: jest.fn(),
        onDownload: jest.fn(),
        onMove: jest.fn(),
        onPrint: jest.fn(),
        onViewSource: jest.fn(),
      }
      render(
        <MailMoreActionsMenu
          {...handlers}
          showArchive
          showDownload
          showMove
          showPrint
          showViewSource
        />
      )
      expect(screen.getByText('mark_unread.string')).toBeInTheDocument()
      expect(screen.getByText('label.string')).toBeInTheDocument()
      expect(screen.getByText('archive.string')).toBeInTheDocument()
      expect(screen.getByText('download.string')).toBeInTheDocument()
      expect(screen.getByText('move.string')).toBeInTheDocument()
      expect(screen.getByText('print.string')).toBeInTheDocument()
      expect(screen.getByText('view_source.string')).toBeInTheDocument()
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
      expect(screen.getByTestId('mail-action-btn-more-actions')).toHaveAttribute(
        'aria-label',
        'more.string'
      )
    })

    it('disables mark unread item when markUnreadDisabled is true', () => {
      render(
        <MailMoreActionsMenu
          onMarkUnread={jest.fn()}
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
