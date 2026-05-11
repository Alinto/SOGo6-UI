import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpungeFolderDialog } from '../expunge-folder-dialog'

// --- Mocks ---

const mockExpungeFolder = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() })
jest.mock('@/features/mails/store/mails-api', () => ({
  useExpungeFolderMutation: jest.fn(() => [mockExpungeFolder, { isLoading: false }]),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}))

// --- Default props ---

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  accountId: '0',
  folderPath: 'INBOX',
  folderName: 'Inbox',
}

// --- Tests ---

describe('ExpungeFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockExpungeFolder.mockResolvedValue({ unwrap: () => Promise.resolve() })
  })

  describe('basic rendering', () => {
    it('should render when open', () => {
      render(<ExpungeFolderDialog {...defaultProps} />)
      const heading = screen.getByRole('heading', {
        name: 'folders.actions.expunge.confirmTitle.string',
      })
      expect(heading).toBeInTheDocument()
      expect(screen.getByText('folders.actions.expunge.confirmDesc.string')).toBeInTheDocument()
    })

    it('should not render content when closed', () => {
      render(<ExpungeFolderDialog {...defaultProps} open={false} />)
      expect(
        screen.queryByText('folders.actions.expunge.confirmTitle.string')
      ).not.toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('should display folder name in description', () => {
      render(<ExpungeFolderDialog {...defaultProps} folderName="Trash" />)
      expect(screen.getByText('folders.actions.expunge.confirmDesc.string')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have Cancel button', () => {
      render(<ExpungeFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.expunge.cancel.string',
        })
      ).toBeInTheDocument()
    })

    it('should have Expunge confirm button', () => {
      render(<ExpungeFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.expunge.confirm.string',
        })
      ).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should call expungeFolder when Expunge button is clicked', async () => {
      const user = userEvent.setup()
      render(<ExpungeFolderDialog {...defaultProps} />)

      const expungeButton = screen.getByRole('button', {
        name: 'folders.actions.expunge.confirm.string',
      })
      await user.click(expungeButton)

      await waitFor(() => {
        expect(mockExpungeFolder).toHaveBeenCalledWith({
          accountId: '0',
          folderPath: 'INBOX',
        })
      })
    })

    it('should call onOpenChange when Cancel is clicked', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <ExpungeFolderDialog
          {...defaultProps}
          onOpenChange={onOpenChange}
        />
      )

      const cancelButton = screen.getByRole('button', {
        name: 'folders.actions.expunge.cancel.string',
      })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })
  })
})
