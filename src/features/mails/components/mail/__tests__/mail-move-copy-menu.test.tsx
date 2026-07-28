import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailMoveCopyMenu from '../mail-move-copy-menu'

const mockFolders = [
  {
    name: 'INBOX',
    path: 'INBOX',
    type: 'INBOX' as const,
    unseen_count: 0,
    messages: 1,
    flags: [],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
  {
    name: 'Archive',
    path: 'Archive',
    type: 'NORMAL' as const,
    unseen_count: 0,
    messages: 0,
    flags: [],
    delimiter: '/',
    readOnly: false,
    selectable: true,
  },
]

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(() => ({ data: mockFolders })),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode
    onOpenChange?: (open: boolean) => void
  }) => (
    <div data-testid="dropdown-menu">
      <button onClick={() => onOpenChange?.(true)}>open-menu</button>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
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
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <button type="button" data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}))

const defaultProps = {
  accountId: '0',
  currentFolder: 'INBOX',
  onSelectDestination: jest.fn(),
  onCreateFolder: jest.fn(),
}

describe('MailMoveCopyMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the trigger button', () => {
    render(<MailMoveCopyMenu {...defaultProps} />)
    expect(screen.getByTestId('mail-action-btn-move-copy')).toBeInTheDocument()
  })

  it('shows move and copy submenu triggers', () => {
    render(<MailMoveCopyMenu {...defaultProps} />)
    expect(screen.getByTestId('mail-action-move-submenu')).toHaveTextContent(
      'move.string'
    )
    expect(screen.getByTestId('mail-action-copy-submenu')).toHaveTextContent(
      'copy.string'
    )
  })

  it('excludes the current folder from the destination list', () => {
    render(<MailMoveCopyMenu {...defaultProps} />)
    expect(screen.queryByText('INBOX')).not.toBeInTheDocument()
    expect(screen.getAllByText('Archive')).toHaveLength(2)
  })

  it('calls onSelectDestination with move mode when a move folder item is clicked', () => {
    const onSelectDestination = jest.fn()
    render(
      <MailMoveCopyMenu
        {...defaultProps}
        onSelectDestination={onSelectDestination}
      />
    )
    fireEvent.click(screen.getAllByText('Archive')[0])
    expect(onSelectDestination).toHaveBeenCalledWith('move', 'Archive')
  })

  it('calls onSelectDestination with copy mode when a copy folder item is clicked', () => {
    const onSelectDestination = jest.fn()
    render(
      <MailMoveCopyMenu
        {...defaultProps}
        onSelectDestination={onSelectDestination}
      />
    )
    fireEvent.click(screen.getAllByText('Archive')[1])
    expect(onSelectDestination).toHaveBeenCalledWith('copy', 'Archive')
  })

  it('calls onCreateFolder with the right mode when "New folder" is clicked', () => {
    const onCreateFolder = jest.fn()
    render(
      <MailMoveCopyMenu {...defaultProps} onCreateFolder={onCreateFolder} />
    )
    const newFolderItems = screen.getAllByText('move_dialog.new_folder.string')
    fireEvent.click(newFolderItems[0])
    expect(onCreateFolder).toHaveBeenCalledWith('move')
    fireEvent.click(newFolderItems[1])
    expect(onCreateFolder).toHaveBeenCalledWith('copy')
  })

  it('disables the trigger when disabled is true', () => {
    render(<MailMoveCopyMenu {...defaultProps} disabled />)
    expect(screen.getByTestId('mail-action-btn-move-copy')).toBeDisabled()
  })

  it('keeps "New folder" outside the scrollable folder list', () => {
    render(<MailMoveCopyMenu {...defaultProps} />)

    const folderItem = screen.getAllByText('Archive')[0]
    const scrollContainer = folderItem.closest('.overflow-y-auto')
    expect(scrollContainer).not.toBeNull()

    const newFolderItem = screen.getAllByText(
      'move_dialog.new_folder.string'
    )[0]
    expect(scrollContainer).not.toBeNull()
    expect(scrollContainer?.contains(newFolderItem)).toBe(false)
  })
})
