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
    folderSharingDisabledAnyAuth: [],
  })),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string, values?: Record<string, string>) => {
    if (values?.folder) return `${key} ${values.folder}`
    if (values?.email) return `${key} ${values.email}`
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

const mockFolderShareData = (users: Record<string, { uid: string; c_email?: string; userClass: string; rights: Record<string, number> }>) => ({
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
    ;(useProfile as jest.Mock).mockReturnValue({
      mainAccount: {
        identities: [{ mail: 'current@example.com', isDefault: true }],
      },
      folderSharingDisabledAnyAuth: [],
    })
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
        screen.getByPlaceholderText(
          'folders.actions.sharing.addUser.placeholder.string'
        )
      ).toBeInTheDocument()
    })

    it('should hide add user section when allowAddUsers is false', () => {
      render(<ShareFolderDialog {...defaultProps} allowAddUsers={false} />)
      expect(
        screen.queryByText('folders.actions.sharing.addUser.label.string')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText(
          'folders.actions.sharing.addUser.placeholder.string'
        )
      ).not.toBeInTheDocument()
    })

    it('should render DialogFooter with Cancel and Save buttons', () => {
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
    it('should show empty state when no users and any-authenticated sharing is disabled', async () => {
      ;(useProfile as jest.Mock).mockReturnValue({
        mainAccount: {
          identities: [{ mail: 'current@example.com', isDefault: true }],
        },
        folderSharingDisabledAnyAuth: ['mail'],
      })
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
            userClass: 'normal-user',
            rights: { userCanReadMails: 1 },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
    })

    it('should show "You" badge for current user', async () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'current@example.com': {
            uid: 'current@example.com',
            c_email: 'current@example.com',
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

  describe('permission editor (expand/collapse)', () => {
    it('should expand a user row to reveal simplified permission checkboxes', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: {
              userCanViewFolder: 1,
              userCanReadMails: 1,
              userCanMarkMailsRead: 1,
              userCanWriteMails: 1,
            },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })

      expect(
        screen.queryByText('folders.actions.sharing.simplified.read.label.string')
      ).not.toBeInTheDocument()

      await user.click(screen.getByText('other@example.com'))

      expect(
        screen.getByText('folders.actions.sharing.simplified.read.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('folders.actions.sharing.simplified.modify.label.string')
      ).toBeInTheDocument()
    })

    it('should collapse a row when clicked again', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: {
              userCanViewFolder: 1,
              userCanReadMails: 1,
              userCanMarkMailsRead: 1,
              userCanWriteMails: 1,
            },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })

      const row = screen.getByText('other@example.com')
      await user.click(row)
      expect(
        screen.getByText('folders.actions.sharing.simplified.read.label.string')
      ).toBeInTheDocument()

      await user.click(row)
      expect(
        screen.queryByText('folders.actions.sharing.simplified.read.label.string')
      ).not.toBeInTheDocument()
    })

    it('should force the read checkbox checked+disabled when modify is checked', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: {
              userCanViewFolder: 1,
              userCanReadMails: 1,
              userCanMarkMailsRead: 0,
              userCanWriteMails: 0,
            },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      const modifyLabel = screen.getByText(
        'folders.actions.sharing.simplified.modify.label.string'
      )
      const modifyCheckbox = modifyLabel.closest('label')?.querySelector('button')
      expect(modifyCheckbox).toBeTruthy()
      await user.click(modifyCheckbox as HTMLElement)

      const readLabel = screen.getByText(
        'folders.actions.sharing.simplified.read.label.string'
      )
      const readCheckbox = readLabel.closest('label')?.querySelector('button')
      expect(readCheckbox).toHaveAttribute('disabled')
      expect(readCheckbox).toHaveAttribute('data-state', 'checked')
    })

    it('should cascade-force read, modify, and delete when move is checked', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: {},
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      const moveLabel = screen.getByText(
        'folders.actions.sharing.simplified.move.label.string'
      )
      const moveCheckbox = moveLabel.closest('label')?.querySelector('button')
      await user.click(moveCheckbox as HTMLElement)

      for (const key of ['read', 'modify', 'delete']) {
        const label = screen.getByText(
          `folders.actions.sharing.simplified.${key}.label.string`
        )
        const checkbox = label.closest('label')?.querySelector('button')
        expect(checkbox).toHaveAttribute('disabled')
        expect(checkbox).toHaveAttribute('data-state', 'checked')
      }
    })

    it('should not force administerRights/administerSubfolders when move is checked', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: {},
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      const moveLabel = screen.getByText(
        'folders.actions.sharing.simplified.move.label.string'
      )
      const moveCheckbox = moveLabel.closest('label')?.querySelector('button')
      await user.click(moveCheckbox as HTMLElement)

      const adminRightsLabel = screen.getByText(
        'folders.actions.sharing.simplified.administerRights.label.string'
      )
      const adminRightsCheckbox = adminRightsLabel
        .closest('label')
        ?.querySelector('button')
      expect(adminRightsCheckbox).not.toHaveAttribute('disabled')
      expect(adminRightsCheckbox).toHaveAttribute('data-state', 'unchecked')
    })

    it('should replace the standard checkboxes with advanced ones when switching view', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'a@example.com': {
            uid: 'a@example.com',
            c_email: 'a@example.com',
            userClass: 'normal-user',
            rights: {
              userCanViewFolder: 1,
              userCanReadMails: 1,
              userCanMarkMailsRead: 1,
              userCanWriteMails: 1,
            },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('a@example.com')).toBeInTheDocument()
      })

      await user.click(screen.getByText('a@example.com'))
      expect(
        screen.getByText('folders.actions.sharing.simplified.read.label.string')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('p - folders.actions.sharing.advanced.userCanPostMails.string')
      ).not.toBeInTheDocument()

      await user.click(
        screen.getByText('folders.actions.sharing.viewToggle.toAdvanced.string')
      )

      expect(
        screen.queryByText('folders.actions.sharing.simplified.read.label.string')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('p - folders.actions.sharing.advanced.userCanPostMails.string')
      ).toBeInTheDocument()

      await user.click(
        screen.getByText('folders.actions.sharing.viewToggle.toStandard.string')
      )
      expect(
        screen.getByText('folders.actions.sharing.simplified.read.label.string')
      ).toBeInTheDocument()
    })

    it('should scope the view toggle to a single row', async () => {
      const user = userEvent.setup()
      const rights = {
        userCanViewFolder: 1,
        userCanReadMails: 1,
        userCanMarkMailsRead: 1,
        userCanWriteMails: 1,
      }
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'a@example.com': {
            uid: 'a@example.com',
            c_email: 'a@example.com',
            userClass: 'normal-user',
            rights,
          },
          'b@example.com': {
            uid: 'b@example.com',
            c_email: 'b@example.com',
            userClass: 'normal-user',
            rights,
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('a@example.com')).toBeInTheDocument()
      })

      await user.click(screen.getByText('a@example.com'))
      await user.click(
        screen.getByText('folders.actions.sharing.viewToggle.toAdvanced.string')
      )
      expect(
        screen.getByText('p - folders.actions.sharing.advanced.userCanPostMails.string')
      ).toBeInTheDocument()

      await user.click(screen.getByText('b@example.com'))
      expect(
        screen.getByText('folders.actions.sharing.simplified.read.label.string')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('p - folders.actions.sharing.advanced.userCanPostMails.string')
      ).not.toBeInTheDocument()
    })
  })

  describe('add user', () => {
    it('should show invalid email error when adding invalid email', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      render(<ShareFolderDialog {...defaultProps} />)

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

    it('should add the new user with no permissions pre-checked and auto-open the standard view panel', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      render(<ShareFolderDialog {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'folders.actions.sharing.addUser.placeholder.string'
      )
      await user.type(input, 'newuser@domain.com')
      const addButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.addUser.button.string',
      })
      await user.click(addButton)

      // Panel auto-opens in standard view without needing to click the row.
      const readLabel = await screen.findByText(
        'folders.actions.sharing.simplified.read.label.string'
      )
      const readCheckbox = readLabel.closest('label')?.querySelector('button')
      expect(readCheckbox).toHaveAttribute('data-state', 'unchecked')

      const modifyLabel = screen.getByText(
        'folders.actions.sharing.simplified.modify.label.string'
      )
      const modifyCheckbox = modifyLabel.closest('label')?.querySelector('button')
      expect(modifyCheckbox).toHaveAttribute('data-state', 'unchecked')
    })

    it('should show duplicate error when adding existing user', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'existing@example.com': {
            uid: 'existing@example.com',
            c_email: 'existing@example.com',
            userClass: 'normal-user',
            rights: { userCanReadMails: 1 },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('existing@example.com')).toBeInTheDocument()
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

  describe('any authenticated user', () => {
    it('should always be displayed in the list when the feature is enabled, even with no other users', async () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(
          screen.getByText(
            'folders.actions.sharing.anyAuthenticatedUser.label.string'
          )
        ).toBeInTheDocument()
      })
    })

    it('should not be displayed when disabled via profile settings', async () => {
      ;(useProfile as jest.Mock).mockReturnValue({
        mainAccount: {
          identities: [{ mail: 'current@example.com', isDefault: true }],
        },
        folderSharingDisabledAnyAuth: ['mail'],
      })
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(
          screen.getByText('folders.actions.sharing.noUsers.string')
        ).toBeInTheDocument()
      })
      expect(
        screen.queryByText(
          'folders.actions.sharing.anyAuthenticatedUser.label.string'
        )
      ).not.toBeInTheDocument()
    })

    it('should start with no permissions pre-checked', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      render(<ShareFolderDialog {...defaultProps} />)

      await user.click(
        await screen.findByText(
          'folders.actions.sharing.anyAuthenticatedUser.label.string'
        )
      )

      const readLabel = await screen.findByText(
        'folders.actions.sharing.simplified.read.label.string'
      )
      const readCheckbox = readLabel.closest('label')?.querySelector('button')
      expect(readCheckbox).toHaveAttribute('data-state', 'unchecked')
    })

    it('should display the pseudo-user last, after named users', async () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'zzz@example.com': {
            uid: 'zzz@example.com',
            c_email: 'zzz@example.com',
            userClass: 'normal-user',
            rights: { userCanReadMails: 1 },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('zzz@example.com')).toBeInTheDocument()
      })

      const names = screen
        .getAllByText(/zzz@example\.com|anyAuthenticatedUser\.label\.string/)
        .map((el) => el.textContent)
      expect(names).toEqual([
        'zzz@example.com',
        'folders.actions.sharing.anyAuthenticatedUser.label.string',
      ])
    })

    it('should not have a remove button (it is a permanent entry)', async () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      const { container } = render(<ShareFolderDialog {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'folders.actions.sharing.anyAuthenticatedUser.label.string'
          )
        ).toBeInTheDocument()
      })

      expect(container.querySelector('button.text-destructive')).toBeNull()
    })

    it('should not re-synthesize the entry when it already exists in fetched data', async () => {
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: { userCanViewFolder: 1, userCanReadMails: 1 },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getAllByText(
            'folders.actions.sharing.anyAuthenticatedUser.label.string'
          )
        ).toHaveLength(1)
      })
    })

    it('should send user_class "any-authenticated-user" when saving', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({})
      )
      render(<ShareFolderDialog {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'folders.actions.sharing.anyAuthenticatedUser.label.string'
          )
        ).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.save.string',
      })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockSetFolderShare).toHaveBeenCalledWith(
          expect.objectContaining({
            users: expect.arrayContaining([
              expect.objectContaining({
                uid: 'anyauthenticated',
                userClass: 'any-authenticated-user',
              }),
            ]),
          })
        )
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
        expect(screen.getByText('user@example.com')).toBeInTheDocument()
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
              applyToSubfolders: false,
            }),
          ]),
        })
      })

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should pass applyToSubfolders: true for a specific user when their checkbox is checked', async () => {
      const user = userEvent.setup()
      ;(useGetFolderShareQuery as jest.Mock).mockReturnValue(
        mockFolderShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: { userCanViewFolder: 1, userCanReadMails: 1 },
          },
        })
      )
      render(<ShareFolderDialog {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })

      await user.click(screen.getByText('other@example.com'))
      await user.click(
        screen.getByText('folders.actions.sharing.applyToSubfolders.string')
      )

      const saveButton = screen.getByRole('button', {
        name: 'folders.actions.sharing.save.string',
      })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockSetFolderShare).toHaveBeenCalledWith(
          expect.objectContaining({
            users: expect.arrayContaining([
              expect.objectContaining({
                uid: 'other@example.com',
                applyToSubfolders: true,
              }),
            ]),
          })
        )
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
    it('should apply max-width class to DialogContent', () => {
      const { container } = render(<ShareFolderDialog {...defaultProps} />)
      const dialogContent = container.querySelector('[class*="sm:max-w-2xl"]')
      expect(dialogContent).toBeInTheDocument()
    })
  })
})
