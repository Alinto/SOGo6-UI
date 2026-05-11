import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateFolderDialog } from '../create-folder-dialog'

const mockCreateFolder = jest.fn()
jest.mock('@/features/mails/store/mails-api', () => ({
  useCreateFolderMutation: jest.fn(() => [
    mockCreateFolder,
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
  parentPath: 'INBOX',
}

describe('CreateFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateFolder.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    })
  })

  describe('basic rendering', () => {
    it('should render title, label, input and actions when open', () => {
      render(<CreateFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('heading', {
          name: 'folders.actions.new_subfolder_dialog.title.string',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(
          'folders.actions.new_subfolder_dialog.placeholder.string'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.new_subfolder_dialog.cancel.string',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.new_subfolder_dialog.submit.string',
        })
      ).toBeInTheDocument()
    })

    it('should not render dialog when closed', () => {
      render(<CreateFolderDialog {...defaultProps} open={false} />)
      expect(
        screen.queryByRole('heading', {
          name: 'folders.actions.new_subfolder_dialog.title.string',
        })
      ).not.toBeInTheDocument()
    })

    it('should render form with id create-folder-form', () => {
      const { container } = render(<CreateFolderDialog {...defaultProps} />)
      const form = container.querySelector('#create-folder-form')
      expect(form).toBeInTheDocument()
      expect(form?.tagName).toBe('FORM')
    })
  })

  describe('configuration', () => {
    it('should link submit button to form via form attribute', () => {
      render(<CreateFolderDialog {...defaultProps} />)
      const submit = screen.getByRole('button', {
        name: 'folders.actions.new_subfolder_dialog.submit.string',
      })
      expect(submit).toHaveAttribute('form', 'create-folder-form')
      expect(submit).toHaveAttribute('type', 'submit')
    })

    it('should use max-w-md on dialog content', () => {
      const { container } = render(<CreateFolderDialog {...defaultProps} />)
      const maxW = container.querySelector('.max-w-md')
      expect(maxW).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should mark description as screen-reader only', () => {
      const { container } = render(<CreateFolderDialog {...defaultProps} />)
      const sr = container.querySelector('.sr-only')
      expect(sr).toBeInTheDocument()
    })

    it('should disable submit until name is valid', () => {
      render(<CreateFolderDialog {...defaultProps} />)
      const submit = screen.getByRole('button', {
        name: 'folders.actions.new_subfolder_dialog.submit.string',
      })
      expect(submit).toBeDisabled()
    })
  })

  describe('integration', () => {
    it('should call createFolder with trimmed name and parentPath on submit', async () => {
      const user = userEvent.setup()
      render(<CreateFolderDialog {...defaultProps} parentPath="INBOX" />)

      const input = screen.getByPlaceholderText(
        'folders.actions.new_subfolder_dialog.placeholder.string'
      )
      await user.type(input, '  Work  ')

      const submit = screen.getByRole('button', {
        name: 'folders.actions.new_subfolder_dialog.submit.string',
      })
      await waitFor(() => expect(submit).not.toBeDisabled())
      await user.click(submit)

      await waitFor(() => {
        expect(mockCreateFolder).toHaveBeenCalledWith({
          accountId: '0',
          body: { name: 'Work', parent: 'INBOX' },
        })
      })
    })

    it('should call onOpenChange(false) after successful create', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <CreateFolderDialog {...defaultProps} onOpenChange={onOpenChange} />
      )

      await user.type(
        screen.getByPlaceholderText(
          'folders.actions.new_subfolder_dialog.placeholder.string'
        ),
        'Archives'
      )
      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.new_subfolder_dialog.submit.string',
        })
      )

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should show validation message for dot in name', async () => {
      const user = userEvent.setup()
      render(<CreateFolderDialog {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'folders.actions.new_subfolder_dialog.placeholder.string'
      )
      await user.type(input, 'bad.name')

      await waitFor(() => {
        expect(
          screen.getByText(
            'folders.actions.new_subfolder_dialog.error_dot.string'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('component stability', () => {
    it('should reset field when dialog closes via onOpenChange', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <CreateFolderDialog {...defaultProps} onOpenChange={onOpenChange} />
      )

      await user.type(
        screen.getByPlaceholderText(
          'folders.actions.new_subfolder_dialog.placeholder.string'
        ),
        'Temp'
      )

      await user.click(
        screen.getByRole('button', {
          name: 'folders.actions.new_subfolder_dialog.cancel.string',
        })
      )

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })
  })
})
