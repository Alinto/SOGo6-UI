import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyFolderDialog } from '../empty-folder-dialog'

const mockPurgeFolder = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  usePurgeFolderMutation: jest.fn(() => [mockPurgeFolder, { isLoading: false }]),
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
    mockPurgeFolder.mockImplementation(() => ({
      unwrap: () => Promise.resolve(),
    }))
  })

  it('renders confirmation dialog when open', () => {
    render(<EmptyFolderDialog {...defaultProps} />)
    expect(
      screen.getByText('folders.actions.empty_folder_dialog.title.string')
    ).toBeInTheDocument()
  })

  it('purges folder permanently on confirm', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<EmptyFolderDialog {...defaultProps} onOpenChange={onOpenChange} />)

    await user.click(
      screen.getByRole('button', {
        name: 'folders.actions.empty_folder_dialog.confirm.string',
      })
    )

    await waitFor(() => {
      expect(mockPurgeFolder).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: '0',
          folderPath: 'Trash',
          permanentlyDelete: true,
          applyToSubfolders: false,
        })
      )
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
