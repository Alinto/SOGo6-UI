import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PurgeFolderDialog } from '../purge-folder-dialog'

// --- Mocks ---

const mockPurgeFolder = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))
jest.mock('@/features/mails/store/mails-api', () => ({
  usePurgeFolderMutation: jest.fn(() => [mockPurgeFolder, { isLoading: false }]),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/components/ui/calendar-core', () => ({
  Calendar: ({ onSelect, selected }: any) => (
    <div data-testid="calendar">
      <button
        type="button"
        onClick={() => onSelect?.(new Date('2024-01-15'))}
      >
        Pick
      </button>
    </div>
  ),
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
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
  hasSubfolders: false,
}

// --- Tests ---

describe('PurgeFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPurgeFolder.mockImplementation(() => ({
      unwrap: () => Promise.resolve(),
    }))
  })

  describe('basic rendering', () => {
    it('should render when open', () => {
      render(<PurgeFolderDialog {...defaultProps} />)
      const heading = screen.getByRole('heading', {
        name: /folders.actions.purge.confirmTitle/,
      })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Inbox')
    })

    it('should not render content when closed', () => {
      render(<PurgeFolderDialog {...defaultProps} open={false} />)
      expect(
        screen.queryByText('folders.actions.purge.confirmTitle.string')
      ).not.toBeInTheDocument()
    })

    it('should render form element', () => {
      const { container } = render(<PurgeFolderDialog {...defaultProps} />)
      expect(container.querySelector('form')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('should display folder name in title', () => {
      render(
        <PurgeFolderDialog
          {...defaultProps}
          folderName="Custom Folder"
        />
      )
      const heading = screen.getByRole('heading', {
        name: /Custom Folder/,
      })
      expect(heading).toHaveTextContent('Custom Folder')
    })

    it('should show apply to subfolders checkbox when hasSubfolders is true', () => {
      render(<PurgeFolderDialog {...defaultProps} hasSubfolders />)
      expect(
        screen.getByText('folders.actions.purge.applyToSubfolders.string')
      ).toBeInTheDocument()
    })

    it('should NOT show apply to subfolders when hasSubfolders is false', () => {
      render(<PurgeFolderDialog {...defaultProps} hasSubfolders={false} />)
      expect(
        screen.queryByText('folders.actions.purge.applyToSubfolders.string')
      ).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have Cancel button', () => {
      render(<PurgeFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.purge.cancel.string',
        })
      ).toBeInTheDocument()
    })

    it('should have Purge confirm button', () => {
      render(<PurgeFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.purge.confirm.string',
        })
      ).toBeInTheDocument()
    })

    it('should have date preset buttons', () => {
      render(<PurgeFolderDialog {...defaultProps} />)
      expect(
        screen.getByText('folders.actions.purge.olderThan.string')
      ).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should call purgeFolder when Purge button is clicked', async () => {
      const user = userEvent.setup()
      render(<PurgeFolderDialog {...defaultProps} />)

      const purgeButton = screen.getByRole('button', {
        name: 'folders.actions.purge.confirm.string',
      })
      await waitFor(() => expect(purgeButton).not.toBeDisabled())
      await user.click(purgeButton)

      await waitFor(() => {
        expect(mockPurgeFolder).toHaveBeenCalledWith(
          expect.objectContaining({
            accountId: '0',
            folderPath: 'INBOX',
            applyToSubfolders: false,
            permanentlyDelete: false,
          })
        )
      })
    })

    it('should call onOpenChange when Cancel is clicked', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <PurgeFolderDialog
          {...defaultProps}
          onOpenChange={onOpenChange}
        />
      )

      const cancelButton = screen.getByRole('button', {
        name: 'folders.actions.purge.cancel.string',
      })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })
  })
})
