import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MailMoveDialog from '../mail-move-dialog'

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
    subfolders: [
      {
        name: 'Work',
        path: 'INBOX/Work',
        type: 'NORMAL' as const,
        unseen_count: 0,
        messages: 0,
        flags: [],
        delimiter: '/',
        readOnly: false,
        selectable: true,
      },
    ],
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

const mockCreateFolder = jest.fn(() => ({
  unwrap: () => Promise.resolve({ path: 'Archive/Projects' }),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(() => ({ data: mockFolders, isFetching: false })),
  useCreateFolderMutation: jest.fn(() => [
    mockCreateFolder,
    { isLoading: false },
  ]),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode
    value: string
    onValueChange: (value: string) => void
  }) => (
    <div data-testid="select" data-value={value}>
      {children}
      <button type="button" onClick={() => onValueChange('Archive')}>
        select-archive
      </button>
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => <div data-value={value}>{children}</div>,
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}))

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  accountId: '0',
  currentFolder: 'INBOX',
  onConfirm: jest.fn(async () => {}),
}

describe('MailMoveDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateFolder.mockImplementation(() => ({
      unwrap: () => Promise.resolve({ path: 'Archive/Projects' }),
    }))
  })

  it('renders the move dialog title', () => {
    render(<MailMoveDialog {...defaultProps} />)
    expect(screen.getByText('move.string')).toBeInTheDocument()
  })

  it('renders the copy dialog title in copy mode', () => {
    render(<MailMoveDialog {...defaultProps} mode="copy" />)
    expect(screen.getByText('copy.string')).toBeInTheDocument()
  })

  it('excludes the current folder from the parent options', () => {
    render(<MailMoveDialog {...defaultProps} />)
    expect(screen.queryByText('INBOX')).not.toBeInTheDocument()
    expect(screen.getByText('Archive')).toBeInTheDocument()
    expect(screen.getByText('INBOX / Work')).toBeInTheDocument()
  })

  it('disables the confirm button until a folder name is entered', () => {
    render(<MailMoveDialog {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'move_dialog.create_and_move.string' })
    ).toBeDisabled()
  })

  it('creates the folder under the selected parent and moves the mail there', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn(async () => {})
    render(<MailMoveDialog {...defaultProps} onConfirm={onConfirm} />)

    await user.click(screen.getByText('select-archive'))
    await user.type(
      screen.getByPlaceholderText('move_dialog.new_folder_placeholder.string'),
      'Projects'
    )
    await user.click(
      screen.getByRole('button', { name: 'move_dialog.create_and_move.string' })
    )

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith({
        accountId: '0',
        body: { name: 'Projects', parent: 'Archive' },
      })
      expect(onConfirm).toHaveBeenCalledWith('Archive/Projects')
    })
  })

  it('creates the folder at root when no parent is selected', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn(async () => {})
    render(<MailMoveDialog {...defaultProps} onConfirm={onConfirm} />)

    await user.type(
      screen.getByPlaceholderText('move_dialog.new_folder_placeholder.string'),
      'Projects'
    )
    await user.click(
      screen.getByRole('button', { name: 'move_dialog.create_and_move.string' })
    )

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith({
        accountId: '0',
        body: { name: 'Projects', parent: '' },
      })
      expect(onConfirm).toHaveBeenCalledWith('Archive/Projects')
    })
  })

  it('creates the folder and copies the mail there in copy mode', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn(async () => {})
    render(
      <MailMoveDialog {...defaultProps} mode="copy" onConfirm={onConfirm} />
    )

    await user.click(screen.getByText('select-archive'))
    await user.type(
      screen.getByPlaceholderText('move_dialog.new_folder_placeholder.string'),
      'Projects'
    )
    await user.click(
      screen.getByRole('button', { name: 'copy_dialog.create_and_copy.string' })
    )

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith({
        accountId: '0',
        body: { name: 'Projects', parent: 'Archive' },
      })
      expect(onConfirm).toHaveBeenCalledWith('Archive/Projects')
    })
  })
})
