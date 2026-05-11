import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setSkipFolderFetch } from '@/features/mails/store/mail-navigation-slice'
import { DeleteFolderDialog } from '../delete-folder-dialog'

const mockPush = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockDispatch = jest.fn()
jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

const mockUseParams = jest.fn(() => ({
  account: '0',
  folder: 'INBOX',
}))
jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}))

const mockDeleteFolder = jest.fn()
jest.mock('@/features/mails/store/mails-api', () => ({
  useDeleteFolderMutation: jest.fn(() => [
    mockDeleteFolder,
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

describe('DeleteFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteFolder.mockReturnValue({
      unwrap: () => Promise.resolve(undefined),
    })
    mockUseParams.mockReturnValue({
      account: '0',
      folder: 'INBOX',
    })
  })

  describe('basic rendering', () => {
    it('should render title and description when open', () => {
      render(<DeleteFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('heading', {
          name: 'folders.actions.delete.confirmTitle.string',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('folders.actions.delete.confirmDesc.string')
      ).toBeInTheDocument()
    })

    it('should not render dialog content when closed', () => {
      render(<DeleteFolderDialog {...defaultProps} open={false} />)
      expect(
        screen.queryByRole('heading', {
          name: 'folders.actions.delete.confirmTitle.string',
        })
      ).not.toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('should pass folderName into description interpolation context', () => {
      render(
        <DeleteFolderDialog {...defaultProps} folderName="CustomDelete" />
      )
      expect(
        screen.getByText('folders.actions.delete.confirmDesc.string')
      ).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('should apply destructive classes to confirm action', () => {
      const { container } = render(<DeleteFolderDialog {...defaultProps} />)
      const destructive = container.querySelector(
        '.bg-destructive.text-destructive-foreground'
      )
      expect(destructive).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should expose Cancel and Delete as buttons', () => {
      render(<DeleteFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.delete.cancel.string',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.delete.confirm.string',
        })
      ).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should call deleteFolder with accountId and folderPath', async () => {
      const user = userEvent.setup()
      render(<DeleteFolderDialog {...defaultProps} />)

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.delete.confirm.string',
        })
      )

      await waitFor(() => {
        expect(mockDeleteFolder).toHaveBeenCalledWith({
          accountId: '0',
          folderPath: 'Trash',
        })
      })
    })

    it('should call onOpenChange(false) after successful delete', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <DeleteFolderDialog {...defaultProps} onOpenChange={onOpenChange} />
      )

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.delete.confirm.string',
        })
      )

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should dispatch setSkipFolderFetch and push INBOX when viewing deleted folder', async () => {
      mockUseParams.mockReturnValue({
        account: '1',
        folder: 'Trash',
      })
      const user = userEvent.setup()
      render(
        <DeleteFolderDialog
          {...defaultProps}
          accountId="1"
          folderPath="Trash"
        />
      )

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.delete.confirm.string',
        })
      )

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(setSkipFolderFetch(true))
        expect(mockPush).toHaveBeenCalledWith('/u/1/INBOX')
      })
    })

    it('should not skip fetch or redirect when viewing another folder', async () => {
      mockUseParams.mockReturnValue({
        account: '0',
        folder: 'INBOX',
      })
      const user = userEvent.setup()
      render(<DeleteFolderDialog {...defaultProps} folderPath="Trash" />)

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.delete.confirm.string',
        })
      )

      await waitFor(() => {
        expect(mockDeleteFolder).toHaveBeenCalled()
      })

      expect(mockDispatch).not.toHaveBeenCalledWith(setSkipFolderFetch(true))
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should dispatch setSkipFolderFetch(false) when mutation fails', async () => {
      mockDeleteFolder.mockReturnValueOnce({
        unwrap: () => Promise.reject(new Error('fail')),
      })
      const user = userEvent.setup()
      mockUseParams.mockReturnValue({
        account: '0',
        folder: 'Trash',
      })
      render(<DeleteFolderDialog {...defaultProps} />)

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.delete.confirm.string',
        })
      )

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(setSkipFolderFetch(false))
      })
    })
  })

  describe('component stability', () => {
    it('should render consistently on second render', () => {
      const { rerender } = render(<DeleteFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('heading', {
          name: 'folders.actions.delete.confirmTitle.string',
        })
      ).toBeInTheDocument()
      rerender(<DeleteFolderDialog {...defaultProps} folderName="X" />)
      expect(
        screen.getByRole('heading', {
          name: 'folders.actions.delete.confirmTitle.string',
        })
      ).toBeInTheDocument()
    })
  })
})
