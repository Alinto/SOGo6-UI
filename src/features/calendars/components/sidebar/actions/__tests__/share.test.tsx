import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareCalendarAction from '../share'

// --- Mocks ---

const mockSetCalendarShare = jest.fn(() => ({
  unwrap: () => Promise.resolve(undefined),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetCalendarShareQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
  })),
  useSetCalendarShareMutation: jest.fn(() => [
    mockSetCalendarShare,
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

jest.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
    disabled,
  }: {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
    disabled?: boolean
  }) => (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => <option value={value}>{children}</option>,
}))

// --- Imports after mocks ---

import {
  useGetCalendarShareQuery,
  useSetCalendarShareMutation,
} from '@/features/calendars/store/calendars-api'
import { useProfile } from '@/features/user-profile'

// --- Default props ---

const defaultProps = {
  id: 'cal-1',
  calendarKey: 'cal-1',
  name: 'My Calendar',
  onClose: jest.fn(),
}

// --- Helpers ---

const mockCalendarShareData = (
  users: Record<
    string,
    {
      uid: string
      c_email?: string
      userClass: string
      rights: {
        public: string
        confidential: string
        private: string
        can_create_objects: boolean
        can_erase_objects: boolean
      }
    }
  >
) => ({
  data: { users },
  isLoading: false,
  isError: false,
})

const NONE_RIGHTS = {
  public: 'none',
  confidential: 'none',
  private: 'none',
  can_create_objects: false,
  can_erase_objects: false,
}

describe('ShareCalendarAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })
    ;(useSetCalendarShareMutation as jest.Mock).mockReturnValue([
      mockSetCalendarShare,
      { isLoading: false },
    ])
    mockSetCalendarShare.mockImplementation(() => ({
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
    it('should render the title with the calendar name', () => {
      render(<ShareCalendarAction {...defaultProps} />)
      expect(screen.getByText('My Calendar')).toBeInTheDocument()
    })

    it('should render the add-user section', () => {
      render(<ShareCalendarAction {...defaultProps} />)
      expect(
        screen.getByText('sidebar.sharing.addUser.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('sidebar.sharing.addUser.placeholder.string')
      ).toBeInTheDocument()
    })

    it('should hide the add-user section when allowAddUsers is false', () => {
      render(<ShareCalendarAction {...defaultProps} allowAddUsers={false} />)
      expect(
        screen.queryByText('sidebar.sharing.addUser.label.string')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText(
          'sidebar.sharing.addUser.placeholder.string'
        )
      ).not.toBeInTheDocument()
    })

    it('should render Cancel and Save buttons', () => {
      render(<ShareCalendarAction {...defaultProps} />)
      expect(
        screen.getByRole('button', { name: 'sidebar.sharing.cancel.string' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'sidebar.sharing.save.string' })
      ).toBeInTheDocument()
    })
  })

  describe('user list', () => {
    it('should display users when data is loaded', async () => {
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareCalendarAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
    })

    it('should show "You" badge for current user', async () => {
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({
          'current@example.com': {
            uid: 'current@example.com',
            c_email: 'current@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareCalendarAction {...defaultProps} />)
      await waitFor(() => {
        expect(
          screen.getByText('sidebar.sharing.badge.you.string')
        ).toBeInTheDocument()
      })
    })

    it('should show empty state when no users and any-authenticated is disabled', async () => {
      ;(useProfile as jest.Mock).mockReturnValue({
        mainAccount: {
          identities: [{ mail: 'current@example.com', isDefault: true }],
        },
        folderSharingDisabledAnyAuth: ['calendar'],
      })
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({})
      )
      render(<ShareCalendarAction {...defaultProps} />)
      await waitFor(() => {
        expect(
          screen.getByText('sidebar.sharing.noUsers.string')
        ).toBeInTheDocument()
      })
    })
  })

  describe('permission editor (expand/collapse)', () => {
    it('should expand a user row to reveal the 3 classification selects and 2 checkboxes', async () => {
      const user = userEvent.setup()
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareCalendarAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })

      expect(
        screen.queryByText('sidebar.sharing.classifications.public.label.string')
      ).not.toBeInTheDocument()

      await user.click(screen.getByText('other@example.com'))

      expect(
        screen.getByText('sidebar.sharing.classifications.public.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'sidebar.sharing.classifications.confidential.label.string'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('sidebar.sharing.classifications.private.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('sidebar.sharing.canCreate.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('sidebar.sharing.canErase.label.string')
      ).toBeInTheDocument()
    })

    it('should keep the 3 classification selects fully independent', async () => {
      const user = userEvent.setup()
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareCalendarAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      const selects = screen.getAllByRole('combobox')
      expect(selects).toHaveLength(3) // public, confidential, private

      fireEvent.change(selects[0], { target: { value: 'modify' } })

      expect(selects[0]).toHaveValue('modify')
      expect(selects[1]).toHaveValue('none')
      expect(selects[2]).toHaveValue('none')
    })

    it('should toggle can_create_objects/can_erase_objects independently', async () => {
      const user = userEvent.setup()
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({
          'other@example.com': {
            uid: 'other@example.com',
            c_email: 'other@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareCalendarAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('other@example.com')).toBeInTheDocument()
      })
      await user.click(screen.getByText('other@example.com'))

      const createLabel = screen.getByText(
        'sidebar.sharing.canCreate.label.string'
      )
      const createCheckbox = createLabel.closest('label')?.querySelector('button')
      await user.click(createCheckbox as HTMLElement)

      expect(createCheckbox).toHaveAttribute('data-state', 'checked')

      const eraseLabel = screen.getByText(
        'sidebar.sharing.canErase.label.string'
      )
      const eraseCheckbox = eraseLabel.closest('label')?.querySelector('button')
      expect(eraseCheckbox).toHaveAttribute('data-state', 'unchecked')
    })
  })

  describe('add user', () => {
    it('should show invalid email error when adding invalid email', async () => {
      const user = userEvent.setup()
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({})
      )
      render(<ShareCalendarAction {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'sidebar.sharing.addUser.placeholder.string'
      )
      await user.type(input, 'invalid-email')
      const addButton = screen.getByRole('button', {
        name: 'sidebar.sharing.addUser.button.string',
      })
      await user.click(addButton)

      await waitFor(() => {
        expect(
          screen.getByText('sidebar.sharing.addUser.error.invalid.string')
        ).toBeInTheDocument()
      })
    })

    it('should add a user with default "none" rights when a valid email is entered', async () => {
      const user = userEvent.setup()
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({})
      )
      render(<ShareCalendarAction {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        'sidebar.sharing.addUser.placeholder.string'
      )
      await user.type(input, 'newuser@domain.com')
      const addButton = screen.getByRole('button', {
        name: 'sidebar.sharing.addUser.button.string',
      })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('newuser@domain.com')).toBeInTheDocument()
      })

      // Auto-expanded panel should show all 3 selects defaulted to "none".
      const selects = screen.getAllByRole('combobox')
      expect(selects.every((s) => (s as HTMLSelectElement).value === 'none')).toBe(
        true
      )
    })

    it('should show duplicate error when adding an existing user', async () => {
      const user = userEvent.setup()
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({
          'existing@example.com': {
            uid: 'existing@example.com',
            c_email: 'existing@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareCalendarAction {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('existing@example.com')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(
        'sidebar.sharing.addUser.placeholder.string'
      )
      await user.type(input, 'existing@example.com')
      const addButton = screen.getByRole('button', {
        name: 'sidebar.sharing.addUser.button.string',
      })
      await user.click(addButton)

      await waitFor(() => {
        expect(
          screen.getByText('sidebar.sharing.addUser.error.duplicate.string')
        ).toBeInTheDocument()
      })
    })
  })

  describe('any authenticated user', () => {
    it('should always be displayed last when the feature is enabled', async () => {
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({
          'zzz@example.com': {
            uid: 'zzz@example.com',
            c_email: 'zzz@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareCalendarAction {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('zzz@example.com')).toBeInTheDocument()
      })

      const names = screen
        .getAllByText(/zzz@example\.com|anyAuthenticatedUser\.label\.string/)
        .map((el) => el.textContent)
      expect(names).toEqual([
        'zzz@example.com',
        'sidebar.sharing.anyAuthenticatedUser.label.string',
      ])
    })

    it('should not be displayed when disabled via profile settings', async () => {
      ;(useProfile as jest.Mock).mockReturnValue({
        mainAccount: {
          identities: [{ mail: 'current@example.com', isDefault: true }],
        },
        folderSharingDisabledAnyAuth: ['calendar'],
      })
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({})
      )
      render(<ShareCalendarAction {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText('sidebar.sharing.noUsers.string')
        ).toBeInTheDocument()
      })
      expect(
        screen.queryByText('sidebar.sharing.anyAuthenticatedUser.label.string')
      ).not.toBeInTheDocument()
    })

    it('should not have a remove button', async () => {
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({})
      )
      const { container } = render(<ShareCalendarAction {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText('sidebar.sharing.anyAuthenticatedUser.label.string')
        ).toBeInTheDocument()
      })
      expect(container.querySelector('button.text-destructive')).toBeNull()
    })

    it('should not be re-synthesized when already present in fetched data', async () => {
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareCalendarAction {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getAllByText(
            'sidebar.sharing.anyAuthenticatedUser.label.string'
          )
        ).toHaveLength(1)
      })
    })

    it('should send user_class "any-authenticated-user" when saving', async () => {
      const user = userEvent.setup()
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({})
      )
      render(<ShareCalendarAction {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText('sidebar.sharing.anyAuthenticatedUser.label.string')
        ).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', {
        name: 'sidebar.sharing.save.string',
      })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockSetCalendarShare).toHaveBeenCalledWith(
          expect.objectContaining({
            calendarKey: 'cal-1',
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

  describe('integration', () => {
    it('should call onClose when Cancel is clicked', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      render(<ShareCalendarAction {...defaultProps} onClose={onClose} />)

      await user.click(
        screen.getByRole('button', { name: 'sidebar.sharing.cancel.string' })
      )
      expect(onClose).toHaveBeenCalled()
    })

    it('should call setCalendarShare and onClose when Save is clicked', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue(
        mockCalendarShareData({
          'user@example.com': {
            uid: 'user@example.com',
            c_email: 'user@example.com',
            userClass: 'normal-user',
            rights: NONE_RIGHTS,
          },
        })
      )
      render(<ShareCalendarAction {...defaultProps} onClose={onClose} />)

      await waitFor(() => {
        expect(screen.getByText('user@example.com')).toBeInTheDocument()
      })

      await user.click(
        screen.getByRole('button', { name: 'sidebar.sharing.save.string' })
      )

      await waitFor(() => {
        expect(mockSetCalendarShare).toHaveBeenCalledWith(
          expect.objectContaining({
            calendarKey: 'cal-1',
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
      ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })
      render(<ShareCalendarAction {...defaultProps} />)
      expect(
        screen.getByRole('button', { name: 'sidebar.sharing.save.string' })
      ).toBeDisabled()
    })
  })
})
