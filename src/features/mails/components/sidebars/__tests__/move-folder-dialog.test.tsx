import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MoveFolderDialog } from '../move-folder-dialog'

const mockMoveFolder = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))

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
    subfolders: [],
  },
]

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(() => ({ data: mockFolders })),
  useMoveFolderMutation: jest.fn(() => [mockMoveFolder, { isLoading: false }]),
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
      <button type="button" onClick={() => onValueChange('')}>
        select-root
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
  folderPath: 'Work',
  folderName: 'Work',
  folderDelimiter: '/',
}

describe('MoveFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMoveFolder.mockImplementation(() => ({
      unwrap: () => Promise.resolve(),
    }))
  })

  it('renders move dialog title', () => {
    render(<MoveFolderDialog {...defaultProps} />)
    expect(
      screen.getByText('folders.actions.move_to_dialog.title.string')
    ).toBeInTheDocument()
  })

  it('moves folder to root when confirmed', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<MoveFolderDialog {...defaultProps} onOpenChange={onOpenChange} />)

    await user.click(
      screen.getByRole('button', {
        name: 'folders.actions.move_to_dialog.confirm.string',
      })
    )

    await waitFor(() => {
      expect(mockMoveFolder).toHaveBeenCalledWith({
        accountId: '0',
        folderPath: 'Work',
        newPath: 'Work',
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
