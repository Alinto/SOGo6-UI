import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { VCard } from '@/features/address_books/address-books-types'
import Page from '../page'

const mockUseGetVCardQuery = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'work', contact_id: 'c1' }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/address_books/store/address-books-api', () => ({
  useGetVCardQuery: () => mockUseGetVCardQuery(),
}))

jest.mock('@/features/address_books/components/visualization', () => ({
  __esModule: true,
  default: ({ data }: { data: VCard }) => (
    <div data-testid="visualization">{data.firstName}</div>
  ),
}))

jest.mock('@/features/address_books/components/skeletons/visualization-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="visualization-skeleton" />,
}))

const contact: VCard = {
  id: 'c1',
  version: '4.0',
  firstName: 'John',
  lastName: 'Doe',
}

describe('AddressBook contact visualization Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders skeleton while loading', () => {
      mockUseGetVCardQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })

      render(<Page />)
      expect(screen.getByTestId('visualization-skeleton')).toBeInTheDocument()
    })

    it('renders visualization when contact is loaded', () => {
      mockUseGetVCardQuery.mockReturnValue({
        data: contact,
        isLoading: false,
        isError: false,
      })

      render(<Page />)
      expect(screen.getByTestId('visualization')).toHaveTextContent('John')
    })
  })

  describe('configuration', () => {
    it('keeps visualization visible during background refetch', () => {
      mockUseGetVCardQuery.mockReturnValue({
        data: contact,
        isLoading: false,
        isError: false,
      })

      render(<Page />)
      expect(screen.getByTestId('visualization')).toHaveTextContent('John')
    })

    it('shows error when query fails', () => {
      mockUseGetVCardQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      })

      render(<Page />)
      expect(screen.getByText('load_error.title.string')).toBeInTheDocument()
    })

    it('shows error when data is an array', () => {
      mockUseGetVCardQuery.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      })

      render(<Page />)
      expect(screen.getByText('load_error.title.string')).toBeInTheDocument()
    })
  })
})
