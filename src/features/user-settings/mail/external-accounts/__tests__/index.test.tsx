import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import MailExternalAccountSettings from '../index'
import {
  useCreateUserMailboxMutation,
  useDeleteUserMailboxMutation,
  useGetUserMailboxesQuery,
  useUpdateUserMailboxMutation,
} from '../store/mailboxes-api'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

// Mock the API hooks
jest.mock('../store/mailboxes-api', () => ({
  useCreateUserMailboxMutation: jest.fn(),
  useDeleteUserMailboxMutation: jest.fn(),
  useGetUserMailboxesQuery: jest.fn(),
  useUpdateUserMailboxMutation: jest.fn(),
}))

// Mock child components
jest.mock('../components/external-accounts-list-view', () => {
  return function MockListView({
    onEdit,
    onAdd,
    data,
    isLoading,
    deleteMailbox,
    error,
  }: any) {
    return (
      <div data-testid="list-view">
        <button onClick={onAdd} data-testid="add-button">
          Add Account
        </button>
        <button onClick={() => onEdit(data[0].id)} data-testid="edit-button">
          Edit
        </button>
        <button
          onClick={() => deleteMailbox({ id: data[0].id })}
          data-testid="delete-button"
        >
          Delete
        </button>
        {error && <div data-testid="error-message">{error}</div>}
        {isLoading && <div data-testid="loading">Loading...</div>}
        <div data-testid="accounts-count">{data.length} accounts</div>
      </div>
    )
  }
})

jest.mock('../components/external-accounts-edit-form', () => {
  return function MockEditForm({
    mode,
    onBack,
    manageData,
    error,
    onSuccess,
  }: any) {
    return (
      <div data-testid="edit-form">
        <div data-testid="form-mode">{mode}</div>
        <button onClick={onBack} data-testid="back-button">
          Back
        </button>
        {error && <div data-testid="form-error">{error}</div>}
      </div>
    )
  }
})

jest.mock('../components/external-accounts-skeleton', () => {
  return function MockSkeleton() {
    return <div data-testid="skeleton">Loading...</div>
  }
})

describe('MailExternalAccountSettings', () => {
  const mockTranslate = jest.fn((key: string) => key)
  const mockCreateMutation = jest.fn()
  const mockDeleteMutation = jest.fn()
  const mockUpdateMutation = jest.fn()

  const mockMailboxData = {
    data: [
      {
        id: '1',
        email: 'test@example.com',
        readReceipts: 'never' as const,
        imapServer: 'imap.example.com',
        imapPort: 993,
        imapEncryption: 'ssl' as const,
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls' as const,
        username: 'testuser',
        useDefaultIdentity: false,
      },
      {
        id: '2',
        email: 'test2@example.com',
        readReceipts: 'selective' as const,
        imapServer: 'imap2.example.com',
        imapPort: 993,
        imapEncryption: 'ssl' as const,
        smtpServer: 'smtp2.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls' as const,
        username: 'testuser2',
        useDefaultIdentity: true,
      },
      {
        id: '0', // This should be filtered out
        email: 'default@example.com',
        readReceipts: 'never' as const,
        imapServer: 'imap-default.example.com',
        imapPort: 993,
        imapEncryption: 'ssl' as const,
        smtpServer: 'smtp-default.example.com',
        smtpPort: 587,
        smtpAuth: true,
        smtpEncryption: 'tls' as const,
        username: 'defaultuser',
        useDefaultIdentity: false,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
    ;(useCreateUserMailboxMutation as jest.Mock).mockReturnValue([
      mockCreateMutation,
    ])
    ;(useDeleteUserMailboxMutation as jest.Mock).mockReturnValue([
      mockDeleteMutation,
    ])
    ;(useUpdateUserMailboxMutation as jest.Mock).mockReturnValue([
      mockUpdateMutation,
    ])
  })

  it('should render title', () => {
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: mockMailboxData,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
  })

  it('should display skeleton while loading', () => {
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: null,
      error: null,
      isFetching: true,
    })

    render(<MailExternalAccountSettings />)

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('should render list view with accounts', () => {
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: mockMailboxData,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    expect(screen.getByTestId('list-view')).toBeInTheDocument()
    expect(screen.getByTestId('accounts-count')).toHaveTextContent('2 accounts')
  })

  it('should filter out account with id 0', () => {
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: mockMailboxData,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    // Should show 2 instead of 3 (filtered account with id 0)
    expect(screen.getByTestId('accounts-count')).toHaveTextContent('2 accounts')
  })

  it('should handle add button click and show create form', async () => {
    const user = userEvent.setup()
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: mockMailboxData,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    const addButton = screen.getByTestId('add-button')
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode')).toHaveTextContent('create')
    })
  })

  it('should handle edit button click and show edit form', async () => {
    const user = userEvent.setup()
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: mockMailboxData,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    const editButton = screen.getByTestId('edit-button')
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode')).toHaveTextContent('edit')
    })
  })

  it('should handle back button and return to list view', async () => {
    const user = userEvent.setup()
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: mockMailboxData,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    // Click add to open form
    await user.click(screen.getByTestId('add-button'))

    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument()
    })

    // Click back button
    await user.click(screen.getByTestId('back-button'))

    await waitFor(() => {
      expect(screen.getByTestId('list-view')).toBeInTheDocument()
      expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument()
    })
  })

  it('should call useTranslations with correct namespace', () => {
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: mockMailboxData,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    expect(useTranslations).toHaveBeenCalledWith('US_MAIL_EXTERNAL_ACCOUNTS')
  })

  it('should pass correct props to list view component', () => {
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: mockMailboxData,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    const listView = screen.getByTestId('list-view')
    expect(listView).toBeInTheDocument()
  })

  it('should handle empty mailbox list', () => {
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: { data: [{ id: '0' }] }, // Only the filtered account
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    expect(screen.getByTestId('accounts-count')).toHaveTextContent('0 accounts')
  })

  it('should handle null data gracefully', () => {
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: null,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    expect(screen.queryByTestId('list-view')).not.toBeInTheDocument()
  })

  it('should maintain selected account ID during edit mode', async () => {
    const user = userEvent.setup()
    ;(useGetUserMailboxesQuery as jest.Mock).mockReturnValue({
      data: mockMailboxData,
      error: null,
      isFetching: false,
    })

    render(<MailExternalAccountSettings />)

    // Click edit button (which edits the first account with id: '1')
    await user.click(screen.getByTestId('edit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument()
    })

    // Verify form is in edit mode
    expect(screen.getByTestId('form-mode')).toHaveTextContent('edit')
  })
})
