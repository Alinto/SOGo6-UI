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

const mockUpdateFolder = jest.fn()
const mockMutationState = { isLoading: false }
jest.mock('@/features/mails/store/mails-api', () => ({
  useUpdateFolderMutation: jest.fn(() => [
    mockUpdateFolder,
    mockMutationState,
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
  folderPath: 'Work',
  currentName: 'Work',
}

describe('RenameFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMutationState.isLoading = false
    mockUpdateFolder.mockReturnValue({
      unwrap: () => Promise.resolve({ name: 'Work' }),
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

    it('should pre-fill the input with currentName', () => {
      render(
        <RenameFolderDialog {...defaultProps} currentName="MyFolder" />
      )
      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      ) as HTMLInputElement
      expect(input.value).toBe('MyFolder')
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
    it('should apply space-y-4 to the form', () => {
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

    it('should expose the name field as a textbox', () => {
      render(<RenameFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('textbox', {
          name: 'folders.actions.rename_dialog.label.string',
        })
      ).toBeInTheDocument()
    })

    it('should disable submit until name is valid when starting empty', () => {
      render(<RenameFolderDialog {...defaultProps} currentName="" />)
      const submit = screen.getByRole('button', {
        name: 'folders.actions.rename_dialog.submit.string',
      })
      expect(submit).toBeDisabled()
    })
  })

  describe('integration', () => {
    it('should call updateFolder with trimmed name and folderPath on submit', async () => {
      const user = userEvent.setup()
      render(
        <RenameFolderDialog
          {...defaultProps}
          folderPath="INBOX/Old"
          currentName="Old"
        />
      )

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, '  NewName  ')

      const submit = screen.getByRole('button', {
        name: 'folders.actions.rename_dialog.submit.string',
      })
      await waitFor(() => expect(submit).not.toBeDisabled())
      await user.click(submit)

      await waitFor(() => {
        expect(mockUpdateFolder).toHaveBeenCalledWith({
          accountId: '0',
          folderPath: 'INBOX/Old',
          body: { name: 'NewName' },
        })
      })
    })

    it('should call onOpenChange(false) after successful rename', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <RenameFolderDialog {...defaultProps} onOpenChange={onOpenChange} />
      )

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should dispatch setSkipFolderFetch and push new path when viewing renamed folder', async () => {
      mockUseParams.mockReturnValue({
        account: '1',
        folder: 'Work',
      })
      const user = userEvent.setup()
      render(
        <RenameFolderDialog
          {...defaultProps}
          accountId="1"
          folderPath="Work"
          currentName="Work"
        />
      )

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'Renamed')

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(setSkipFolderFetch(true))
        expect(mockPush).toHaveBeenCalledWith('/u/1/Renamed')
      })
    })

    it('should join folder segments when folder is an array', async () => {
      mockUseParams.mockReturnValue({
        account: '0',
        folder: ['INBOX', 'Work'],
      })
      const user = userEvent.setup()
      render(
        <RenameFolderDialog
          {...defaultProps}
          folderPath="INBOX/Work"
          currentName="Work"
        />
      )

      const input = screen.getByPlaceholderText(
        'folders.actions.rename_dialog.placeholder.string'
      )
      await user.clear(input)
      await user.type(input, 'Renamed')

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(setSkipFolderFetch(true))
        expect(mockPush).toHaveBeenCalledWith('/u/0/Renamed')
      })
    })

    it('should not skip fetch or redirect when viewing another folder', async () => {
      mockUseParams.mockReturnValue({
        account: '0',
        folder: 'INBOX',
      })
      const user = userEvent.setup()
      render(<RenameFolderDialog {...defaultProps} folderPath="Work" />)

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.rename_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(mockUpdateFolder).toHaveBeenCalled()
      })

      expect(mockDispatch).not.toHaveBeenCalledWith(setSkipFolderFetch(true))
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should dispatch setSkipFolderFetch(false) when mutation fails', async () => {
      mockUpdateFolder.mockReturnValueOnce({
        unwrap: () => Promise.reject(new Error('fail')),
      })
      mockUseParams.mockReturnValue({
        account: '0',
        folder: 'Work',
      })
      const user = userEvent.setup()
      render(<RenameFolderDialog {...defaultProps} />)

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
  })

  describe('component stability', () => {
    it('should render consistently on second render', () => {
      const { rerender } = render(<RenameFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('heading', {
          name: 'folders.actions.rename_dialog.title.string',
        })
      ).toBeInTheDocument()
      rerender(
        <RenameFolderDialog {...defaultProps} currentName="Other" />
      )
      expect(
        screen.getByRole('heading', {
          name: 'folders.actions.rename_dialog.title.string',
        })
      ).toBeInTheDocument()
    })
  })

  describe('responsive layout', () => {
    it('should keep dialog content in a constrained width container', () => {
      const { container } = render(<RenameFolderDialog {...defaultProps} />)
      const dialogSurface = container.querySelector('[class*="max-w-md"]')
      expect(dialogSurface).toBeInTheDocument()
    })
  })
})
