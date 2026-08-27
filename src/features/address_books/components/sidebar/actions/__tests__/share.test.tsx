import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareAddressBookAction from '../share'

// --- Mocks ---

const mockRefetch = jest.fn()

const mockSetAddressBookShare = jest.fn(() => ({
  unwrap: () => Promise.resolve(undefined),
}))

const mockSubscribeAddressBookUser = jest.fn(() => ({
  unwrap: () => Promise.resolve(undefined),
}))

jest.mock('@/features/address_books/store/address-books-api', () => ({
  useGetAddressBookShareQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
  })),
  useSetAddressBookShareMutation: jest.fn(() => [
    mockSetAddressBookShare,
    { isLoading: false },
  ]),
  useSubscribeAddressBookUserMutation: jest.fn(() => [
    mockSubscribeAddressBookUser,
    { isLoading: false },
  ]),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(() => ({
    mainAccount: {
      identities: [{ mail: 'current@example.com', isDefault: true }],
    },
    folderSharingDisabledAnyAuth: [] as string[],
  })),
}))

jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}))

// --- Imports after mocks ---

import {
  useGetAddressBookShareQuery,
  useSetAddressBookShareMutation,
  useSubscribeAddressBookUserMutation,
} from '@/features/address_books/store/address-books-api'
import { useProfile } from '@/features/user-profile'

// --- Default props ---

const defaultProps = {
  id: 'book-1',
  name: 'My Address Book',
  onClose: jest.fn(),
}

// --- Helpers ---

const NONE_RIGHTS = {
  can_view: false,
  can_create_objects: false,
  can_edit_objects: false,
  can_erase_objects: false,
}

const mockShareData = (
  users: Record<
    string,
    {
      uid: string
      c_email?: string
      userClass: string
      rights: typeof NONE_RIGHTS
      subscribed?: boolean
    }
  >
) => ({
  data: { users },
  isLoading: false,
  isError: false,
  refetch: mockRefetch,
})

describe('ShareAddressBookAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    })
    ;(useSetAddressBookShareMutation as jest.Mock).mockReturnValue([
      mockSetAddressBookShare,
      { isLoading: false },
    ])
    ;(useSubscribeAddressBookUserMutation as jest.Mock).mockReturnValue([
      mockSubscribeAddressBookUser,
      { isLoading: false },
    ])
    mockSetAddressBookShare.mockImplementation(() => ({
      unwrap: () => Promise.resolve(undefined),
    }))
    mockSubscribeAddressBookUser.mockImplementation(() => ({
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
    it('should render the title with the address book name', () => {
      render(<ShareAddressBookAction {...defaultProps} />)
      expect(screen.getByText('My Address Book')).toBeInTheDocument()
    })

    it('should render the add-user section', () => {
      render(<ShareAddressBookAction {...defaultProps} />)
      expect(
        screen.getByText('sharing.addUser.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('sharing.addUser.placeholder.string')
      ).toBeInTheDocument()
    })

    it('should hide the add-user section when allowAddUsers is false', () => {
      render(<ShareAddressBookAction {...defaultProps} allowAddUsers={false} />)
      expect(
        screen.queryByText('sharing.addUser.label.string')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText('sharing.addUser.placeholder.string')
      ).not.toBeInTheDocument()
    })

    it('should render Cancel and Save buttons', () => {
      render(<ShareAddressBookAction {...defaultProps} />)
      expect(
        screen.getByRole('button', { name: 'sharing.cancel.string' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'sharing.save.string' })
      ).toBeInTheDocument()
    })
  })

  describe('user list', () => {
    it('should display users when data is loaded', async () => {
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
    })

    it('should show "You" badge for current user', async () => {
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'current@example.com': {
            uid: 'current@example.com',
            c_email: 'current@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('sharing.badge.you.string')).toBeInTheDocument()
      })
    })

    it('should show empty state when no users and any-authenticated is disabled', async () => {
      ;(useProfile as jest.Mock).mockReturnValue({
        mainAccount: {
          identities: [{ mail: 'current@example.com', isDefault: true }],
        },
        folderSharingDisabledAnyAuth: ['contact'],
      })
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({})
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('sharing.noUsers.string')).toBeInTheDocument()
      })
    })
  })

  describe('load error', () => {
    it('should show an error message and retry button instead of the empty state', async () => {
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      })
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('sharing.loadError.string')).toBeInTheDocument()
      })
      expect(screen.queryByText('sharing.noUsers.string')).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'sharing.retry.string' })
      ).toBeInTheDocument()
    })

    it('should call refetch when the retry button is clicked', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      })
      render(<ShareAddressBookAction {...defaultProps} />)
      await user.click(
        await screen.findByRole('button', { name: 'sharing.retry.string' })
      )
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('should hide the add-user section and disable Save while in the error state', async () => {
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      })
      render(<ShareAddressBookAction {...defaultProps} />)
      await screen.findByText('sharing.loadError.string')
      expect(
        screen.queryByPlaceholderText('sharing.addUser.placeholder.string')
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'sharing.save.string' })
      ).toBeDisabled()
    })
  })

  describe('permission editor (expand/collapse)', () => {
    it('should expand a user row to reveal the 4 permission checkboxes', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })

      expect(
        screen.queryByText('sharing.permissions.canView.label.string')
      ).not.toBeInTheDocument()

      await user.click(screen.getByText('other@example.com'))

      expect(
        screen.getByText('sharing.permissions.canView.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('sharing.permissions.canCreateObjects.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('sharing.permissions.canEditObjects.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('sharing.permissions.canEraseObjects.label.string')
      ).toBeInTheDocument()
    })

    it('should toggle permissions independently', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      const createLabel = screen.getByText(
        'sharing.permissions.canCreateObjects.label.string'
      )
      const createCheckbox = createLabel.closest('label')?.querySelector('button')
      await user.click(createCheckbox as HTMLElement)

      expect(createCheckbox).toHaveAttribute('data-state', 'checked')

      const eraseLabel = screen.getByText(
        'sharing.permissions.canEraseObjects.label.string'
      )
      const eraseCheckbox = eraseLabel.closest('label')?.querySelector('button')
      expect(eraseCheckbox).toHaveAttribute('data-state', 'unchecked')
    })

    it('should force can_view on (and disable it) when can_edit_objects is checked', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      const editLabel = screen.getByText(
        'sharing.permissions.canEditObjects.label.string'
      )
      const editCheckbox = editLabel.closest('label')?.querySelector('button')
      await user.click(editCheckbox as HTMLElement)

      const viewLabel = screen.getByText(
        'sharing.permissions.canView.label.string'
      )
      const viewCheckbox = viewLabel.closest('label')?.querySelector('button')
      expect(viewCheckbox).toHaveAttribute('data-state', 'checked')
      expect(viewCheckbox).toBeDisabled()
    })
  })

  describe('subscribe user action', () => {
    it('should render a "Subscribe this user" switch in the expanded panel', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      const switchEl = screen.getByRole('switch')
      expect(switchEl).toBeInTheDocument()
      expect(switchEl).toHaveAttribute('data-state', 'unchecked')
      expect(
        screen.getByText('sharing.subscribeUser.button.string')
      ).toBeInTheDocument()
    })

    it('should call subscribeAddressBookUser with the book id and target uid when toggled on', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      await user.click(screen.getByRole('switch'))

      await waitFor(() => {
        expect(mockSubscribeAddressBookUser).toHaveBeenCalledWith({
          bookId: 'book-1',
          uid: 'other@example.com',
        })
      })
    })

    it('should mark the switch checked and disabled after a successful call, without wiping unrelated rights edits', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      await user.click(screen.getByRole('switch'))

      await waitFor(() => {
        expect(
          screen.getAllByText('sharing.subscribeUser.subscribed.string').length
        ).toBeGreaterThan(0)
      })
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAttribute('data-state', 'checked')
      expect(switchEl).toBeDisabled()
    })

    it('should not render the subscribe action for the any-authenticated pseudo-user', async () => {
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({})
      )
      const user = userEvent.setup()
      render(<ShareAddressBookAction {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText('sharing.anyAuthenticatedUser.label.string')
        ).toBeInTheDocument()
      })
      await user.click(
        screen.getByText('sharing.anyAuthenticatedUser.label.string')
      )

      expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })
  })

  describe('add user', () => {
    it('should show invalid email error when adding invalid email', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({})
      )
      render(<ShareAddressBookAction {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'sharing.addUser.placeholder.string'
      )
      await user.type(input, 'invalid-email')
      const addButton = screen.getByRole('button', {
        name: 'sharing.addUser.button.string',
      })
      await user.click(addButton)

      await waitFor(() => {
        expect(
          screen.getByText('sharing.addUser.error.invalid.string')
        ).toBeInTheDocument()
      })
    })

    it('should add a user with all rights off by default when a valid email is entered', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({})
      )
      render(<ShareAddressBookAction {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'sharing.addUser.placeholder.string'
      )
      await user.type(input, 'newuser@domain.com')
      const addButton = screen.getByRole('button', {
        name: 'sharing.addUser.button.string',
      })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('newuser@domain.com')).toBeInTheDocument()
      })

      const viewLabel = screen.getByText(
        'sharing.permissions.canView.label.string'
      )
      const viewCheckbox = viewLabel.closest('label')?.querySelector('button')
      expect(viewCheckbox).toHaveAttribute('data-state', 'unchecked')
    })

    it('should show duplicate error when adding an existing user', async () => {
      const user = userEvent.setup()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'existing@example.com': {
            uid: 'existing@example.com',
            c_email: 'existing@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('existing@example.com')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(
        'sharing.addUser.placeholder.string'
      )
      await user.type(input, 'existing@example.com')
      const addButton = screen.getByRole('button', {
        name: 'sharing.addUser.button.string',
      })
      await user.click(addButton)

      await waitFor(() => {
        expect(
          screen.getByText('sharing.addUser.error.duplicate.string')
        ).toBeInTheDocument()
      })
    })
  })

  describe('any authenticated user', () => {
    it('should always be displayed last when the feature is enabled', async () => {
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'zzz@example.com': {
            uid: 'zzz@example.com',
            c_email: 'zzz@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('zzz@example.com')).toBeInTheDocument()
      })

      const names = screen
        .getAllByText(/zzz@example\.com|anyAuthenticatedUser\.label\.string/)
        .map((el) => el.textContent)
      expect(names).toEqual([
        'zzz@example.com',
        'sharing.anyAuthenticatedUser.label.string',
      ])
    })

    it('should not be displayed when disabled via profile settings', async () => {
      ;(useProfile as jest.Mock).mockReturnValue({
        mainAccount: {
          identities: [{ mail: 'current@example.com', isDefault: true }],
        },
        folderSharingDisabledAnyAuth: ['contact'],
      })
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({})
      )
      render(<ShareAddressBookAction {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('sharing.noUsers.string')).toBeInTheDocument()
      })
      expect(
        screen.queryByText('sharing.anyAuthenticatedUser.label.string')
      ).not.toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should call onClose when Cancel is clicked', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      render(<ShareAddressBookAction {...defaultProps} onClose={onClose} />)

      await user.click(
        screen.getByRole('button', { name: 'sharing.cancel.string' })
      )
      expect(onClose).toHaveBeenCalled()
    })

    it('should call setAddressBookShare and onClose when Save is clicked', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue(
        mockShareData({
          'user@example.com': {
            uid: 'user@example.com',
            c_email: 'user@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareAddressBookAction {...defaultProps} onClose={onClose} />)

      await waitFor(() => {
        expect(screen.getByText('user@example.com')).toBeInTheDocument()
      })

      await user.click(
        screen.getByRole('button', { name: 'sharing.save.string' })
      )

      await waitFor(() => {
        expect(mockSetAddressBookShare).toHaveBeenCalledWith(
          expect.objectContaining({
            bookId: 'book-1',
            users: expect.arrayContaining([
              expect.objectContaining({ uid: 'user@example.com' }),
            ]),
          })
        )
      })
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('should disable the Save button while loading', () => {
      ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })
      render(<ShareAddressBookAction {...defaultProps} />)
      expect(
        screen.getByRole('button', { name: 'sharing.save.string' })
      ).toBeDisabled()
    })
  })
})
