import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Default from '../default'

const mockUseAddressBookEntries = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'work' }),
}))

jest.mock('@/features/address_books/hooks/use-address-book-entries', () => ({
  useAddressBookEntries: () => mockUseAddressBookEntries(),
}))

jest.mock('@/features/address_books/components/list', () => ({
  __esModule: true,
  default: ({
    items,
    serverSide,
  }: {
    items: unknown[]
    serverSide?: boolean
  }) => (
    <div data-testid="address-book-list" data-server-side={String(serverSide)}>
      {items.length}
    </div>
  ),
}))

jest.mock('@/features/address_books/components/skeletons/list-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="list-skeleton" />,
}))

describe('AddressBook [book_id] Default', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders list skeleton while fetching', () => {
      mockUseAddressBookEntries.mockReturnValue({
        items: [],
        isFetching: true,
        totalPages: 1,
        page: 1,
        searchTooShort: false,
      })

      render(<Default />)
      expect(screen.getByTestId('list-skeleton')).toBeInTheDocument()
    })

    it('renders contact list when data is loaded', () => {
      mockUseAddressBookEntries.mockReturnValue({
        items: [{ id: 'c1' }, { id: 'c2' }],
        isFetching: false,
        totalPages: 1,
        page: 1,
        searchTooShort: false,
      })

      render(<Default />)
      expect(screen.getByTestId('address-book-list')).toHaveTextContent('2')
    })
  })

  describe('configuration', () => {
    it('passes serverSide mode to the list', () => {
      mockUseAddressBookEntries.mockReturnValue({
        items: [{ id: 'c1' }],
        isFetching: false,
        totalPages: 2,
        page: 1,
        searchTooShort: false,
      })

      render(<Default />)
      expect(screen.getByTestId('address-book-list')).toHaveAttribute(
        'data-server-side',
        'true'
      )
    })
  })
})
