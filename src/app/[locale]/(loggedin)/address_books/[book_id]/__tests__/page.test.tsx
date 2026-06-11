import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../page'

const mockUseGetAddressBookVCardsQuery = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'work' }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/address_books/store/address-books-api', () => ({
  useGetAddressBookVCardsQuery: () => mockUseGetAddressBookVCardsQuery(),
}))

jest.mock('@/features/address_books/components/list', () => ({
  __esModule: true,
  default: ({ items }: { items: unknown[] }) => (
    <div data-testid="address-book-list">{items.length}</div>
  ),
}))

jest.mock('@/features/address_books/components/skeletons/list-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="list-skeleton" />,
}))

describe('AddressBook [book_id] Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders list skeleton while fetching', () => {
      mockUseGetAddressBookVCardsQuery.mockReturnValue({
        data: undefined,
        isFetching: true,
        isError: false,
      })

      render(<Page />)
      expect(screen.getByTestId('list-skeleton')).toBeInTheDocument()
    })

    it('renders contact list when data is loaded', () => {
      mockUseGetAddressBookVCardsQuery.mockReturnValue({
        data: [{ id: 'c1' }, { id: 'c2' }],
        isFetching: false,
        isError: false,
      })

      render(<Page />)
      expect(screen.getByTestId('address-book-list')).toHaveTextContent('2')
    })
  })

  describe('configuration', () => {
    it('shows error message when query fails', () => {
      mockUseGetAddressBookVCardsQuery.mockReturnValue({
        data: undefined,
        isFetching: false,
        isError: true,
      })

      render(<Page />)
      expect(screen.getByText('load_error.list.string')).toBeInTheDocument()
    })
  })
})
