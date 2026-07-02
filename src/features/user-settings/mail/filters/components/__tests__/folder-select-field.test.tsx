import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useGetFoldersQuery } from '@/features/mails/store/mails-api'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(),
}))

jest.mock('@/features/mails/components/utils', () => ({
  iconSelector: () => 'inbox',
}))

jest.mock('lucide-react/dynamic', () => ({
  DynamicIcon: () => <span data-testid="folder-icon" />,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
  }) => (
    <div data-testid="popover" data-open={String(open)}>
      {typeof children === 'function' ? null : children}
      <button type="button" onClick={() => onOpenChange(!open)}>
        toggle-popover
      </button>
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}))

jest.mock('@/components/ui/command', () => ({
  Command: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandInput: ({ placeholder }: { placeholder?: string }) => (
    <input placeholder={placeholder} />
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandEmpty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandItem: ({
    children,
    onSelect,
    value,
  }: {
    children: React.ReactNode
    onSelect: () => void
    value: string
  }) => (
    <button type="button" onClick={onSelect} data-value={value}>
      {children}
    </button>
  ),
}))

import FolderSelectField from '../folder-select-field'

const mockFolders = [
  {
    name: 'INBOX',
    path: 'INBOX',
    subfolders: [{ name: 'Work', path: 'INBOX/Work' }],
  },
]

describe('FolderSelectField', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: mockFolders,
      isLoading: false,
    })
  })

  it('renders combobox with placeholder when no value selected', () => {
    render(<FolderSelectField value="" onChange={mockOnChange} />)
    expect(
      screen.getByRole('combobox', { name: 'folder_select.aria_label.string' })
    ).toHaveTextContent('folder_select.placeholder.string')
  })

  it('displays selected folder path', () => {
    render(
      <FolderSelectField value="INBOX/Work" onChange={mockOnChange} />
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('INBOX/Work')
  })

  it('calls onChange when a folder is selected', async () => {
    const user = userEvent.setup()
    render(<FolderSelectField value="" onChange={mockOnChange} />)
    await user.click(screen.getByRole('button', { name: /INBOX\/Work/i }))
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('INBOX/Work')
    })
  })

  it('disables combobox while folders are loading', () => {
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    })
    render(<FolderSelectField value="" onChange={mockOnChange} />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('fetches folders for the given accountId', () => {
    render(
      <FolderSelectField value="" onChange={mockOnChange} accountId="acc-9" />
    )
    expect(useGetFoldersQuery).toHaveBeenCalledWith({ accountId: 'acc-9' })
  })
})
