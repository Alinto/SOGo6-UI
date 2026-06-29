import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { VCard } from '@/features/address_books/address-books-types'
import Page from '../page'

const mockUseGetVCardQuery = jest.fn()
const mockUseSearchParams = jest.fn(() => new URLSearchParams())

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'work', contact_id: 'c1' }),
  useSearchParams: () => mockUseSearchParams(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/address_books/store/address-books-api', () => ({
  useGetVCardQuery: (arg: unknown) => mockUseGetVCardQuery(arg),
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
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
    mockUseGetVCardQuery.mockReturnValue({
      data: contact,
      isLoading: false,
      isError: false,
    })
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
      render(<Page />)
      expect(screen.getByTestId('visualization')).toHaveTextContent('John')
    })
  })

  describe('configuration', () => {
    it('keeps visualization visible during background refetch', () => {
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

    it('passes group kind from search params to the query', () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams('kind=group'))

      render(<Page />)

      expect(mockUseGetVCardQuery).toHaveBeenCalledWith({
        id: 'c1',
        book_id: 'work',
        kind: 'group',
      })
    })
  })
})
