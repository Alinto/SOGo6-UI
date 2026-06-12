import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import AddressBookContent from '../address-book-content'

const mockUseGetAddressBooksQuery = jest.fn()
const mockUseGetAddressBookVCardsQuery = jest.fn()
const mockDispatch = jest.fn()

jest.mock('@/features/address_books', () => ({
  getContactDisplayName: (contact: {
    firstName: string
    lastName: string
    kind?: string
  }) =>
    contact.kind === 'group'
      ? contact.firstName
      : `${contact.firstName} ${contact.lastName}`.trim(),
  getDistributionListEmails: (contact: { members?: { email: string }[] }) =>
    (contact.members ?? []).map((member) => member.email).filter(Boolean),
  getDistributionListMemberCount: (contact: { members?: unknown[] }) =>
    contact.members?.length ?? 0,
  partitionAddressBookEntries: (
    items: Array<{ id: string; kind?: string; firstName: string; lastName: string }>,
    searchQuery: string
  ) => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = query
      ? items.filter((item) =>
          `${item.firstName} ${item.lastName}`.toLowerCase().includes(query)
        )
      : items

    return {
      distributionLists: filtered.filter((item) => item.kind === 'group'),
      contacts: filtered.filter((item) => item.kind !== 'group'),
    }
  },
  useGetAddressBooksQuery: () => mockUseGetAddressBooksQuery(),
  useGetAddressBookVCardsQuery: () => mockUseGetAddressBookVCardsQuery(),
}))

jest.mock('@/features/mails/store', () => ({
  createDraft: jest.fn((payload) => ({
    type: 'mailCompose/createDraft',
    payload,
  })),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroupContent: ({
    children,
    ...props
  }: {
    children: ReactNode
  }) => (
    <div data-testid="sidebar-group-content" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: ReactNode
    asChild?: boolean
    onClick?: () => void
    'aria-label'?: string
  }) =>
    asChild ? (
      children
    ) : (
      <button type="button" onClick={onClick} aria-label={ariaLabel}>
        {children}
      </button>
    ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}))

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  AvatarFallback: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: (string | boolean | undefined)[]) =>
    args.filter(Boolean).join(' '),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { number?: number }) => {
    if (key === 'member_count' && values?.number !== undefined) {
      return `${values.number} members`
    }
    return key
  },
}))

describe('AddressBookContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetAddressBooksQuery.mockReturnValue({
      data: {
        personals: [{ id: 'personal-1', name: 'Personal', default: true }],
        globals: [],
        subscriptions: [],
      },
      isLoading: false,
      isError: false,
    })
    mockUseGetAddressBookVCardsQuery.mockReturnValue({
      data: [
        {
          id: 'list-1',
          kind: 'group',
          firstName: 'Sales Team',
          lastName: '',
          members: [
            { email: 'sales@example.com' },
            { email: 'team@example.com' },
          ],
        },
        {
          id: 'contact-1',
          firstName: 'Jane',
          lastName: 'Doe',
          organization: 'Acme',
          emails: ['jane@example.com'],
        },
      ],
      isLoading: false,
    })
  })

  it('renders distribution lists and contacts in separate sections', () => {
    render(<AddressBookContent />)

    expect(screen.getByTestId('address-book-panel')).toBeInTheDocument()
    expect(screen.getByTestId('fast-access-section-lists')).toBeInTheDocument()
    expect(screen.getByTestId('fast-access-section-contacts')).toBeInTheDocument()
    expect(screen.getByText('Sales Team')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('2 members')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('links entries to the address book detail page', () => {
    render(<AddressBookContent />)

    expect(screen.getByRole('link', { name: /Jane Doe/i })).toHaveAttribute(
      'href',
      '/address_books/personal-1/contact-1'
    )
    expect(screen.getByRole('link', { name: /Sales Team/i })).toHaveAttribute(
      'href',
      '/address_books/personal-1/list-1'
    )
  })

  it('filters entries with the search field', async () => {
    const user = userEvent.setup()
    render(<AddressBookContent />)

    await user.type(screen.getByTestId('fast-access-contacts-search'), 'Jane')

    expect(screen.queryByText('Sales Team')).not.toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('dispatches compose draft for a contact with email', async () => {
    const user = userEvent.setup()
    render(<AddressBookContent />)

    const contactRow = screen.getByTestId('fast-access-contact-row')
    await user.click(contactRow.querySelector('button[aria-label="compose"]')!)

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mailCompose/createDraft',
        payload: expect.objectContaining({
          initialData: {
            to: [{ email: 'jane@example.com', name: 'Jane Doe' }],
          },
        }),
      })
    )
  })

  it('shows loading state', () => {
    mockUseGetAddressBooksQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    render(<AddressBookContent />)

    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockUseGetAddressBooksQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    render(<AddressBookContent />)

    expect(screen.getByText('error')).toBeInTheDocument()
  })
})
