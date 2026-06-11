import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import AddressBookContent from '../address-book-content'

const mockUseGetAddressBooksQuery = jest.fn()
const mockUseGetAddressBookVCardsQuery = jest.fn()

jest.mock('@/features/address_books', () => ({
  filterAndSortContacts: (contacts: unknown[]) => contacts,
  isIndividualContact: () => true,
  useGetAddressBooksQuery: () => mockUseGetAddressBooksQuery(),
  useGetAddressBookVCardsQuery: () => mockUseGetAddressBookVCardsQuery(),
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
  }: {
    children: ReactNode
    asChild?: boolean
  }) => (asChild ? children : <button type="button">{children}</button>),
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
  useTranslations: () => (key: string) => key,
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
          id: 'contact-1',
          firstName: 'Jane',
          lastName: 'Doe',
          organization: 'Acme',
        },
      ],
      isLoading: false,
    })
  })

  it('renders the address book panel with contacts', () => {
    render(<AddressBookContent />)

    expect(screen.getByTestId('address-book-panel')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Jane Doe/i })).toHaveAttribute(
      'href',
      '/address_books/personal-1/contact-1'
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
