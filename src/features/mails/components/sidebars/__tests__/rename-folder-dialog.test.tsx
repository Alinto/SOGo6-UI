import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setSkipFolderFetch } from '@/features/mails/store/mail-navigation-slice'
import { RenameFolderDialog } from '../rename-folder-dialog'

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

const mockRenameFolder = jest.fn()
jest.mock('@/features/mails/store/mails-api', () => ({
  useRenameFolderMutation: jest.fn(() => [
    mockRenameFolder,
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
  folderPath: 'INBOX.Work',
  folderName: 'Work',
  folderDelimiter: '.',
}

describe('RenameFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRenameFolder.mockReturnValue({
      unwrap: () => Promise.resolve(undefined),
    })
    mockUseParams.mockReturnValue({
      account: '0',
      folder: 'INBOX',
    })
  })

  describe('basic rendering', () => {
    it('should render title, label, input and actions when open', () => {
      render(<RenameFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('heading', {
          name: 'folders.actions.rename_dialog.title.string',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(
          'folders.actions.rename_dialog.placeholder.string'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.cancel.string',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      ).toBeInTheDocument()
    })

    it('should not render dialog when closed', () => {
      render(<RenameFolderDialog {...defaultProps} open={false} />)
      expect(
        screen.queryByRole('heading', {
          name: 'folders.actions.rename_dialog.title.string',
        })
      ).not.toBeInTheDocument()
    })

    it('should render form with id rename-folder-form', () => {
      const { container } = render(<RenameFolderDialog {...defaultProps} />)
      const form = container.querySelector('#rename-folder-form')
      expect(form).toBeInTheDocument()
      expect(form?.tagName).toBe('FORM')
    })
  })

  describe('configuration', () => {
    it('should prefill input with folderName', () => {
      render(<RenameFolderDialog {...defaultProps} folderName="Projects" />)
      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      expect(input).toHaveValue('Projects')
    })

    it('should link submit button to form via form attribute', () => {
      render(<RenameFolderDialog {...defaultProps} />)
      const submit = screen.getByRole('button', {
        name: 'folders.actions.rename_dialog.submit.string',
      })
      expect(submit).toHaveAttribute('form', 'rename-folder-form')
      expect(submit).toHaveAttribute('type', 'submit')
    })

    it('should use max-w-md on dialog content', () => {
      const { container } = render(<RenameFolderDialog {...defaultProps} />)
      const maxW = container.querySelector('.max-w-md')
      expect(maxW).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('should apply space-y-4 on form', () => {
      const { container } = render(<RenameFolderDialog {...defaultProps} />)
      const form = container.querySelector('#rename-folder-form')
      expect(form).toHaveClass('space-y-4')
    })
  })

  describe('accessibility', () => {
    it('should mark description as screen-reader only', () => {
      const { container } = render(<RenameFolderDialog {...defaultProps} />)
      const sr = container.querySelector('.sr-only')
      expect(sr).toBeInTheDocument()
    })

    it('should enable submit when name is valid and changed', async () => {
      const user = userEvent.setup()
      render(<RenameFolderDialog {...defaultProps} />)
      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'Renamed')
      const submit = screen.getByRole('button', {
        name: 'folders.actions.rename_dialog.submit.string',
      })
      await waitFor(() => expect(submit).not.toBeDisabled())
    })
  })

  describe('integration', () => {
    it('should call renameFolder with trimmed name on submit', async () => {
      const user = userEvent.setup()
      render(<RenameFolderDialog {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, '  Renamed  ')

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(mockRenameFolder).toHaveBeenCalledWith({
          accountId: '0',
          folderPath: 'INBOX.Work',
          body: { name: 'Renamed' },
        })
      })
    })

    it('should call onOpenChange(false) after successful rename', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <RenameFolderDialog {...defaultProps} onOpenChange={onOpenChange} />
      )

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'NewName')

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should close without mutation when name is unchanged', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <RenameFolderDialog
          {...defaultProps}
          folderName="Work"
          onOpenChange={onOpenChange}
        />
      )

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
      expect(mockRenameFolder).not.toHaveBeenCalled()
    })

    it('should dispatch setSkipFolderFetch and push when viewing renamed folder', async () => {
      const user = userEvent.setup()
      mockUseParams.mockReturnValue({
        account: '1',
        folder: 'INBOX.Work',
      })
      render(
        <RenameFolderDialog
          {...defaultProps}
          accountId="1"
          folderPath="INBOX.Work"
          folderName="Work"
        />
      )

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'Projects')

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(setSkipFolderFetch(true))
        expect(mockPush).toHaveBeenCalledWith(
          '/u/1/' + encodeURIComponent('INBOX.Projects')
        )
      })
    })

    it('should redirect descendant folder path when viewing subfolder', async () => {
      const user = userEvent.setup()
      mockUseParams.mockReturnValue({
        account: '0',
        folder: 'INBOX.Work.Sub',
      })
      render(
        <RenameFolderDialog
          {...defaultProps}
          folderPath="INBOX.Work"
          folderName="Work"
        />
      )

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'Projects')

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          '/u/0/' + encodeURIComponent('INBOX.Projects.Sub')
        )
      })
    })

    it('should not skip fetch or redirect when viewing another folder', async () => {
      const user = userEvent.setup()
      mockUseParams.mockReturnValue({
        account: '0',
        folder: 'INBOX',
      })
      render(<RenameFolderDialog {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'Other')

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(mockRenameFolder).toHaveBeenCalled()
      })

      expect(mockDispatch).not.toHaveBeenCalledWith(setSkipFolderFetch(true))
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should dispatch setSkipFolderFetch(false) when mutation fails', async () => {
      const user = userEvent.setup()
      mockRenameFolder.mockReturnValueOnce({
        unwrap: () => Promise.reject(new Error('fail')),
      })
      mockUseParams.mockReturnValue({
        account: '0',
        folder: 'INBOX.Work',
      })
      render(<RenameFolderDialog {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'Fail')

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(setSkipFolderFetch(false))
      })
    })

    it('should show validation message for dot in name', async () => {
      const user = userEvent.setup()
      render(<RenameFolderDialog {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'bad.name')

      await waitFor(() => {
        expect(
          screen.getByText('folders.actions.rename_dialog.error_dot.string')
        ).toBeInTheDocument()
      })
    })

    it('should show validation message for empty name', async () => {
      const user = userEvent.setup()
      render(<RenameFolderDialog {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)

      await waitFor(() => {
        expect(
          screen.getByText('folders.actions.rename_dialog.error_required.string')
        ).toBeInTheDocument()
      })
    })
  })

  describe('component stability', () => {
    it('should reset field when dialog closes via cancel', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <RenameFolderDialog {...defaultProps} onOpenChange={onOpenChange} />
      )

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'Temp')

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.cancel.string',
        })
      )

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should render consistently on second render', () => {
      const { rerender } = render(<RenameFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('heading', {
          name: 'folders.actions.rename_dialog.title.string',
        })
      ).toBeInTheDocument()
      rerender(
        <RenameFolderDialog {...defaultProps} folderName="Updated" />
      )
      expect(
        screen.getByRole('heading', {
          name: 'folders.actions.rename_dialog.title.string',
        })
      ).toBeInTheDocument()
    })
  })
})
