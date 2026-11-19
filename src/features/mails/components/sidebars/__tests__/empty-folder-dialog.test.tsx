import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyFolderDialog } from '../empty-folder-dialog'

const mockEmptyFolder = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useEmptyFolderMutation: jest.fn(() => [
    mockEmptyFolder,
    { isLoading: false },
  ]),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}))

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  accountId: '0',
  folderPath: 'Trash',
  folderName: 'Trash',
}

describe('EmptyFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEmptyFolder.mockImplementation(() => ({
      unwrap: () => Promise.resolve(),
    }))
  })

  it('renders confirmation dialog when open', () => {
    render(<EmptyFolderDialog {...defaultProps} />)
    expect(
      screen.getByText('folders.actions.empty_folder_dialog.title.string')
    ).toBeInTheDocument()
  })

  it('empties the folder on confirm', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<EmptyFolderDialog {...defaultProps} onOpenChange={onOpenChange} />)

    await user.click(
      screen.getByRole('button', {
        name: 'folders.actions.empty_folder_dialog.confirm.string',
      })
    )

    await waitFor(() => {
      expect(mockEmptyFolder).toHaveBeenCalledWith({
        accountId: '0',
        folderPath: 'Trash',
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('keeps the dialog open when emptying fails', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    mockEmptyFolder.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('boom')),
    }))
    render(<EmptyFolderDialog {...defaultProps} onOpenChange={onOpenChange} />)

    await user.click(
      screen.getByRole('button', {
        name: 'folders.actions.empty_folder_dialog.confirm.string',
      })
    )

    await waitFor(() => expect(mockEmptyFolder).toHaveBeenCalled())
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
