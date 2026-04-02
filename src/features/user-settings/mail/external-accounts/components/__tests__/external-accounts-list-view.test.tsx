import { MailboxSettings } from '@/features/user-settings/mail/external-accounts/store/mailboxes-form-types'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import ExternalAccountsListView from '../external-accounts-list-view'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

// Mock UI components
jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogAction: ({ children, onClick, disabled }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="alert-dialog-action"
    >
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, disabled }: any) => (
    <button disabled={disabled} data-testid="alert-dialog-cancel">
      {children}
    </button>
  ),
  AlertDialogContent: ({ children }: any) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogDescription: ({ children }: any) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: any) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogHeader: ({ children }: any) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: any) => (
    <h2 data-testid="alert-dialog-title">{children}</h2>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h1 data-testid="card-title">{children}</h1>
  ),
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockT = (key: string, options?: any) => {
  const map: Record<string, string> = {
    'list.title.string': 'External Accounts',
    'list.add_button.string': 'Add Account',
    'list.empty.string': 'No accounts configured',
    'list.edit_button_aria.string': 'Edit account',
    'list.delete_button_aria.string': 'Delete account',
    'list.delete_confirm_title.string': 'Delete account',
    'list.delete_confirm_desc.string': 'Are you sure?',
    'list.cancel_button.string': 'Cancel',
    'list.confirm_delete_button.string': 'Delete',
    'notifications.errors_api.load_failed.string': 'Failed to load',
  }
  return map[key] ?? key
}

function mockMailbox(overrides = {}): MailboxSettings {
  return {
    id: 'mailbox-1',
    name: 'account@example.com',
    mail_server: {
      server: 'imap.example.com',
      port: 993,
      encryption: 'implicit_tls',
      auth_mech: 'plain',
      username: 'user',
      password: 'pass',
    },
    mail_outgoing: {
      server: 'smtp.example.com',
      port: 587,
      encryption: 'explicit_tls',
      auth_mech: 'login',
      username: 'user',
      password: 'pass',
    },
    identities: [
      {
        mail: 'account@example.com',
        name: 'Main Account',
        replyTo: 'reply@example.com',
        isDefault: true,
        signatures: {},
      },
    ],
    receipts: {
      enabled: false,
      not_to_cc: 'never',
      outside_domain: 'never',
      other: 'never',
    },
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ExternalAccountsListView', () => {
  const mockOnAdd = jest.fn()
  const mockOnEdit = jest.fn()
  const mockDeleteMailbox = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockT)
  })

  // ── rendering ─────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the component without crashing', () => {
      render(
        <ExternalAccountsListView
          data={[]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('displays the title', () => {
      render(
        <ExternalAccountsListView
          data={[]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      expect(screen.getByText('External Accounts')).toBeInTheDocument()
    })

    it('displays the add button', () => {
      render(
        <ExternalAccountsListView
          data={[]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      expect(screen.getByText('Add Account')).toBeInTheDocument()
    })
  })

  // ── loading state ─────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('displays skeleton loaders when isLoading is true', () => {
      render(
        <ExternalAccountsListView
          data={undefined}
          isLoading={true}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('displays multiple skeleton loaders', () => {
      render(
        <ExternalAccountsListView
          data={undefined}
          isLoading={true}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThanOrEqual(3)
    })
  })

  // ── empty state ───────────────────────────────────────────────────────────

  describe('empty state', () => {
    it('displays empty state message when data is empty', () => {
      render(
        <ExternalAccountsListView
          data={[]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      expect(screen.getByText('No accounts configured')).toBeInTheDocument()
    })
  })

  // ── data display ──────────────────────────────────────────────────────────

  describe('data display', () => {
    it('displays accounts in the list', () => {
      const accounts = [
        mockMailbox({ id: '1', name: 'account1@example.com' }),
        mockMailbox({ id: '2', name: 'account2@example.com' }),
      ]
      render(
        <ExternalAccountsListView
          data={accounts}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      expect(screen.getByText('account1@example.com')).toBeInTheDocument()
      expect(screen.getByText('account2@example.com')).toBeInTheDocument()
    })

    it('displays account names correctly', () => {
      const account = mockMailbox({ name: 'mymail@domain.com' })
      render(
        <ExternalAccountsListView
          data={[account]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      expect(screen.getByText('mymail@domain.com')).toBeInTheDocument()
    })

    it('displays multiple accounts', () => {
      const accounts = Array.from({ length: 5 }, (_, i) =>
        mockMailbox({ id: `${i}`, name: `account${i}@example.com` })
      )
      render(
        <ExternalAccountsListView
          data={accounts}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      accounts.forEach((account) => {
        expect(screen.getByText(account.name)).toBeInTheDocument()
      })
    })
  })

  // ── user interactions ─────────────────────────────────────────────────────

  describe('user interactions', () => {
    it('calls onAdd when add button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ExternalAccountsListView
          data={[]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      const addButton = screen.getByText('Add Account')
      await user.click(addButton)
      expect(mockOnAdd).toHaveBeenCalledTimes(1)
    })

    it('calls onEdit with account id when edit button is clicked', async () => {
      const user = userEvent.setup()
      const account = mockMailbox({ id: 'test-id' })
      render(
        <ExternalAccountsListView
          data={[account]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      const editButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('data-variant') === 'ghost')
      await user.click(editButtons[0])
      expect(mockOnEdit).toHaveBeenCalledWith('test-id')
    })

    it('opens delete confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      const account = mockMailbox({ id: 'test-id', name: 'test@example.com' })
      render(
        <ExternalAccountsListView
          data={[account]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      // Find delete button (Trash2 icon button, second button in the actions)
      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons[buttons.length - 1]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument()
      })
    })
  })

  // ── delete confirmation ───────────────────────────────────────────────────

  describe('delete confirmation', () => {
    it('displays confirmation dialog with account name', async () => {
      const user = userEvent.setup()
      const account = mockMailbox({ id: 'test-id', name: 'test@example.com' })
      render(
        <ExternalAccountsListView
          data={[account]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      const deleteButton =
        screen.getAllByRole('button')[screen.getAllByRole('button').length - 1]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog-title')).toBeInTheDocument()
      })
    })

    it('calls deleteMailbox when confirming deletion', async () => {
      const user = userEvent.setup()
      const account = mockMailbox({ id: 'mailbox-123' })
      render(
        <ExternalAccountsListView
          data={[account]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      const deleteButton =
        screen.getAllByRole('button')[screen.getAllByRole('button').length - 1]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog-action')).toBeInTheDocument()
      })

      const confirmButton = screen.getByTestId('alert-dialog-action')
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteMailbox).toHaveBeenCalledWith({ id: 'mailbox-123' })
      })
    })

    it('closes dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      const account = mockMailbox({ id: 'test-id' })
      const { rerender } = render(
        <ExternalAccountsListView
          data={[account]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      const deleteButton =
        screen.getAllByRole('button')[screen.getAllByRole('button').length - 1]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog-cancel')).toBeInTheDocument()
      })

      const cancelButton = screen.getByTestId('alert-dialog-cancel')
      await user.click(cancelButton)

      expect(mockDeleteMailbox).not.toHaveBeenCalled()
    })
  })

  // ── error state ───────────────────────────────────────────────────────────

  describe('error state', () => {
    it('displays error message when error prop is provided', () => {
      const errorMessage = 'Failed to load external accounts'
      render(
        <ExternalAccountsListView
          data={undefined}
          isLoading={false}
          error={errorMessage}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    })

    it('displays error with API error details', () => {
      const apiError = 'API Error: 500 Internal Server Error'
      render(
        <ExternalAccountsListView
          data={undefined}
          isLoading={false}
          error={apiError}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      expect(screen.getByText(new RegExp(apiError))).toBeInTheDocument()
    })
  })

  // ── accessibility ─────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria labels on action buttons', () => {
      const account = mockMailbox({ name: 'test@example.com' })
      render(
        <ExternalAccountsListView
          data={[account]}
          isLoading={false}
          error={null}
          onEdit={mockOnEdit}
          onAdd={mockOnAdd}
          deleteMailbox={mockDeleteMailbox}
        />
      )
      // Both edit and delete buttons should have aria-labels
      const buttons = screen.getAllByRole('button')
      expect(buttons.some((btn) => btn.hasAttribute('aria-label'))).toBe(true)
    })
  })
})
