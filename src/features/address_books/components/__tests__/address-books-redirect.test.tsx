import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'

const mockPush = jest.fn()
const mockUseGetAddressBooksQuery = jest.fn()

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../store/address-books-api', () => ({
  useGetAddressBooksQuery: () => mockUseGetAddressBooksQuery(),
}))

jest.mock('../skeletons/list-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="list-skeleton" />,
}))

import AddressBooksRedirect from '../address-books-redirect'

describe('AddressBooksRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders skeleton while loading', () => {
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })

      render(<AddressBooksRedirect />)
      expect(screen.getByTestId('list-skeleton')).toBeInTheDocument()
    })

    it('shows error when no default book is available', () => {
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: { personals: [], subscriptions: [], globals: [] },
        isLoading: false,
        isError: false,
      })

      render(<AddressBooksRedirect />)
      expect(screen.getByText('load_error.list.string')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('redirects to default address book when data is loaded', async () => {
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [{ id: 'default-book', default: true, name: 'Personal' }],
          subscriptions: [],
          globals: [],
        },
        isLoading: false,
        isError: false,
      })

      render(<AddressBooksRedirect />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/address_books/default-book')
      })
    })
  })
})
