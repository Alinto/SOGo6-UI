import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShareFolderDialog } from '../share-folder-dialog'

// --- Mocks ---

// RTK mutation trigger returns synchronously { unwrap: () => Promise } — not a Promise
const mockSetFolderShare = jest.fn(() => ({
  unwrap: () => Promise.resolve(undefined),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFolderShareQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
  })),
  useSetFolderShareMutation: jest.fn(() => [mockSetFolderShare, { isLoading: false }]),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(() => ({
    mainAccount: {
      identities: [{ mail: 'current@example.com', isDefault: true }],
    },
  })),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string, values?: Record<string, string>) => {
    if (values?.folder) return `${key} ${values.folder}`
    return key
  }),
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => <div data-testid="portal">{children}</div>,
}))

// --- Imports after mocks ---

import { useGetFolderShareQuery, useSetFolderShareMutation } from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'

// --- Default props ---

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  accountId: '0',
  folderPath: 'INBOX',
  folderName: 'Inbox',
}

// --- Helpers ---

const mockFolderShareData = (users: Record<string, { uid: string; c_email?: string; cn?: string; userClass: string; rights: Record<string, number> }>) => ({
  data: { users },
  isLoading: false,
  isError: false,
})

// --- Tests ---

describe('ShareFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useGetFolderShareQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })
    ;(useSetFolderShareMutation as jest.Mock).mockReturnValue([
      mockSetFolderShare,
      { isLoading: false },
    ])
    mockSetFolderShare.mockImplementation(() => ({
      unwrap: () => Promise.resolve(undefined),
    }))
  })

  describe('basic rendering', () => {
    it('should render when open', () => {
      render(<ShareFolderDialog {...defaultProps} />)
      expect(
        screen.getByText('folders.actions.sharing.title.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('folders.actions.sharing.description.string Inbox')
      ).toBeInTheDocument()
    })

    it('should display folder name in title', () => {
      render(<ShareFolderDialog {...defaultProps} folderName="Custom Folder" />)
      expect(screen.getByText('Custom Folder')).toBeInTheDocument()
    })

    it('should render add user section', () => {
      render(<ShareFolderDialog {...defaultProps} />)
      expect(
        screen.getByText('folders.actions.sharing.addUser.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('folders.actions.sharing.addUser.placeholder.string')
      ).toBeInTheDocument()
    })

    it('should render SheetFooter with Cancel and Save buttons', () => {
      render(<ShareFolderDialog {...defaultProps} />)
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.sharing.cancel.string',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'folders.actions.sharing.save.string',
        })
      ).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('should pass accountId and folderPath to useGetFolderShareQuery when open', () => {
      render(
        <ShareFolderDialog
          {...defaultProps}
          accountId="0"
          folderPath="INBOX"
        />
      )
      expect(useGetFolderShareQuery).toHaveBeenCalledWith(
        { accountId: '0', folderPath: 'INBOX' },
        expect.objectContaining({ skip: false })
      )
    })

    it('should skip query when closed', () => {
      render(<ShareFolderDialog {...defaultProps} open={false} />)
      expect(useGetFolderShareQuery).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ skip: true })
      )
    })
  })

  describe('loading state', () => {
    it('should show skeleton loaders when isLoading is true', () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })
      const { container } = render(<ShareFolderDialog {...defaultProps} />)
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('empty state', () => {
    it('should show empty state when no users', async () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(
          screen.getByText('folders.actions.sharing.noUsers.string')
        ).toBeInTheDocument()
      })
    })
  })

  describe('user list', () => {
    it('should display users when data is loaded', async () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            cn: 'Other User',
            userClass: 'normal-user',
            rights: { userCanReadMails: 1 },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('Other User')).toBeInTheDocument()
      })
    })

    it('should show "You" badge for current user', async () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'current@example.com': {
            uid: 'current@example.com',
            c_email: 'current@example.com',
            cn: 'Current User',
            userClass: 'normal-user',
            rights: { userCanReadMails: 1 },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('folders.actions.sharing.badge.you.string')).toBeInTheDocument()
      })
    })

    it('should show "Public" badge for public-user', async () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'public@example.com': {
            uid: 'public@example.com',
            c_email: 'public@example.com',
            cn: 'Public User',
            userClass: 'public-user',
            rights: { userCanReadMails: 1 },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('folders.actions.sharing.badge.public.string')).toBeInTheDocument()
      })
    })
  })

  describe('add user', () => {
    it('should show invalid email error when adding invalid email', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('folders.actions.sharing.addUser.placeholder.string')
        ).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(
        'folders.actions.sharing.addUser.placeholder.string'
      )
      await user.type(input, 'invalid-email')
      const addButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.addUser.button.string',
      })
      await user.click(addButton)

      await waitFor(() => {
        expect(
          screen.getByText('folders.actions.sharing.addUser.error.invalid.string')
        ).toBeInTheDocument()
      })
    })

    it('should add user when valid email is entered', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('folders.actions.sharing.addUser.placeholder.string')
        ).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(
        'folders.actions.sharing.addUser.placeholder.string'
      )
      await user.type(input, 'newuser@domain.com')
      const addButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.addUser.button.string',
      })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('newuser@domain.com')).toBeInTheDocument()
      })
    })

    it('should show duplicate error when adding existing user', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'existing@example.com': {
            uid: 'existing@example.com',
            c_email: 'existing@example.com',
            cn: 'Existing',
            userClass: 'normal-user',
            rights: { userCanReadMails: 1 },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('Existing')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(
        'folders.actions.sharing.addUser.placeholder.string'
      )
      await user.type(input, 'existing@example.com')
      const addButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.addUser.button.string',
      })
      await user.click(addButton)

      await waitFor(() => {
        expect(
          screen.getByText('folders.actions.sharing.addUser.error.duplicate.string')
        ).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have Cancel button with correct role', () => {
      render(<ShareFolderDialog {...defaultProps} />)
      const cancelButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.cancel.string',
      })
      expect(cancelButton).toBeInTheDocument()
    })

    it('should have Save button with correct role', () => {
      render(<ShareFolderDialog {...defaultProps} />)
      const saveButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.save.string',
      })
      expect(saveButton).toBeInTheDocument()
    })

    it('should have Add button with sr-only label', () => {
      render(<ShareFolderDialog {...defaultProps} />)
      const addButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.addUser.button.string',
      })
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should call onOpenChange(false) when Cancel is clicked', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(
        <ShareFolderDialog
          {...defaultProps}
          onOpenChange={onOpenChange}
        />
      )

      const cancelButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.cancel.string',
      })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should call setFolderShare and onOpenChange when Save is clicked', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'user@example.com': {
            uid: 'user@example.com',
            c_email: 'user@example.com',
            cn: 'Test User',
            userClass: 'normal-user',
            rights: { userCanReadMails: 1 },
          },
        })
      )
      render(
        <ShareFolderDialog
          {...defaultProps}
          onOpenChange={onOpenChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.save.string',
      })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockSetFolderShare).toHaveBeenCalledWith({
          accountId: '0',
          folderPath: 'INBOX',
          users: expect.arrayContaining([
            expect.objectContaining({
              uid: 'user@example.com',
              userClass: 'normal-user',
            }),
          ]),
        })
      })

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should disable Save button when isLoading', () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })
      render(<ShareFolderDialog {...defaultProps} />)
      const saveButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.save.string',
      })
      expect(saveButton).toBeDisabled()
    })
  })

  describe('custom styling', () => {
    it('should apply max-width class to SheetContent', () => {
      const { container } = render(<ShareFolderDialog {...defaultProps} />)
      const sheetContent = container.querySelector('[class*="sm:max-w-[480px]"]')
      expect(sheetContent).toBeInTheDocument()
    })
  })
})
