import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useProfile } from '@/features/user-profile'
import { useGetAddressBooksQuery } from '@/features/address_books/store/address-books-api'
import AddressBooksAccessSettings from '../index'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('@/features/address_books/store/address-books-api', () => ({
  useGetAddressBooksQuery: jest.fn(),
}))

jest.mock('../components/address-book-access-list-row', () => ({
  __esModule: true,
  default: ({ addressBook }: { addressBook: { name: string } }) => (
    <div data-testid="address-book-access-row">{addressBook.name}</div>
  ),
}))

jest.mock('../components/address-book-access-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="address-book-access-skeleton" />,
}))

describe('AddressBooksAccessSettings', () => {
  const mockTranslate = jest.fn((key: string) => key)

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
    ;(useProfile as jest.Mock).mockReturnValue({ folderSharingDisabled: [] })
  })

  it('renders page title and description', () => {
    ;(useGetAddressBooksQuery as jest.Mock).mockReturnValue({
      data: { globals: [], personals: [], subscriptions: [] },
      error: undefined,
      isLoading: false,
    })

    render(<AddressBooksAccessSettings />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('page.description.string')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    ;(useGetAddressBooksQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(<AddressBooksAccessSettings />)

    expect(
      screen.getByTestId('address-book-access-skeleton')
    ).toBeInTheDocument()
  })

  it('renders a row per personal address book only', () => {
    ;(useGetAddressBooksQuery as jest.Mock).mockReturnValue({
      data: {
        globals: [{ id: 'g1', name: 'Global', type: 'global', description: '' }],
        personals: [
          { id: 'p1', name: 'My Contacts', type: 'personal', description: '' },
        ],
        subscriptions: [
          { id: 's1', name: 'Shared', type: 'shared', description: '' },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    render(<AddressBooksAccessSettings />)

    const rows = screen.getAllByTestId('address-book-access-row')
    expect(rows).toHaveLength(1)
    expect(screen.getByText('My Contacts')).toBeInTheDocument()
  })

  it('shows empty state when there are no personal address books', () => {
    ;(useGetAddressBooksQuery as jest.Mock).mockReturnValue({
      data: { globals: [], personals: [], subscriptions: [] },
      error: undefined,
      isLoading: false,
    })

    render(<AddressBooksAccessSettings />)

    expect(screen.getByText('empty.string')).toBeInTheDocument()
  })

  it('shows the disabled message when contact sharing is disabled', () => {
    ;(useProfile as jest.Mock).mockReturnValue({
      folderSharingDisabled: ['contact'],
    })
    ;(useGetAddressBooksQuery as jest.Mock).mockReturnValue({
      data: {
        globals: [],
        personals: [
          { id: 'p1', name: 'My Contacts', type: 'personal', description: '' },
        ],
        subscriptions: [],
      },
      error: undefined,
      isLoading: false,
    })

    render(<AddressBooksAccessSettings />)

    expect(screen.getByText('disabled.string')).toBeInTheDocument()
    expect(
      screen.queryByTestId('address-book-access-row')
    ).not.toBeInTheDocument()
  })
})
