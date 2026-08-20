import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountSwitcher } from '../account-switcher'

// --- Mocks ---

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ account: '0' })),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: any) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: any) => <li>{children}</li>,
  SidebarMenuButton: ({ children, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

// --- Imports after mocks ---

import { useProfile } from '@/features/user-profile'
import { useRouter } from '@/lib/i18n/navigation'
import { useParams } from 'next/navigation'

// --- Helpers ---

const mockProfile = (overrides = {}) => {
  ;(useProfile as jest.Mock).mockReturnValue({
    allMailboxes: [
      {
        id: '0',
        name: '',
        identities: [{ mail: 'jdoe@sogo.nu' }],
      },
    ],
    defaultIdentity: { mail: 'jdoe@sogo.nu' },
    canAddExternalAccount: false,
    isLoading: false,
    ...overrides,
  })
}

// --- Tests ---

describe('AccountSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
    ;(useParams as jest.Mock).mockReturnValue({ account: '0' })
  })

  describe('Loading state', () => {
    it('renders loading state', () => {
      mockProfile({ isLoading: true, allMailboxes: [], defaultIdentity: null })
      render(<AccountSwitcher />)
      expect(screen.getByText('…')).toBeInTheDocument()
    })

    it('renders disabled button when loading', () => {
      mockProfile({ isLoading: true, allMailboxes: [], defaultIdentity: null })
      render(<AccountSwitcher />)
      expect(screen.getByRole('button', { disabled: true })).toBeInTheDocument()
    })
  })

  describe('Render', () => {
    it('displays the current account email', () => {
      mockProfile()
      render(<AccountSwitcher />)
      expect(screen.getAllByText('jdoe@sogo.nu')).toHaveLength(2)
    })

    it('falls back to auth user email when profile mailboxes are missing', () => {
      mockProfile({
        allMailboxes: [],
        defaultIdentity: null,
        user: {
          uid: 'sogo-tests1@example.org',
          cn: 'John Paul',
          email: 'sogo-tests1@example.org',
        },
      })
      render(<AccountSwitcher />)
      expect(screen.getByText('sogo-tests1@example.org')).toBeInTheDocument()
    })

    it('does not show add account button when canAddExternalAccount is false', () => {
      mockProfile()
      render(<AccountSwitcher />)
      expect(
        screen.queryByText('account_switcher.add_account.string')
      ).not.toBeInTheDocument()
    })

    it('shows add account button when canAddExternalAccount is true', () => {
      mockProfile({ canAddExternalAccount: true })
      render(<AccountSwitcher />)
      expect(
        screen.getByText('account_switcher.add_account.string')
      ).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates to correct mailbox on click', async () => {
      const user = userEvent.setup()
      const mockPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
      mockProfile()
      render(<AccountSwitcher />)

      const [, menuItem] = screen.getAllByText('jdoe@sogo.nu')
      await user.click(menuItem.closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
    })

    it('navigates to imap settings when add account is clicked', async () => {
      const user = userEvent.setup()
      const mockPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
      mockProfile({ canAddExternalAccount: true })
      render(<AccountSwitcher />)

      const addBtn = screen
        .getByText('account_switcher.add_account.string')
        .closest('button')!
      await user.click(addBtn)

      expect(mockPush).toHaveBeenCalledWith(
        '/user_settings/mail/external_accounts'
      )
    })
  })

  describe('Multiple accounts', () => {
    it('renders all mailboxes', () => {
      mockProfile({
        allMailboxes: [
          { id: '0', name: '', identities: [{ mail: 'jdoe@sogo.nu' }] },
          {
            id: '1',
            name: 'perso@gmail.com',
            identities: [{ mail: 'perso@gmail.com' }],
          },
        ],
      })
      render(<AccountSwitcher />)
      expect(screen.getAllByText('jdoe@sogo.nu')).toHaveLength(2)
      expect(screen.getByText('perso@gmail.com')).toBeInTheDocument()
    })
  })
})
