import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../page'

jest.mock('@/features/address_books/components/address-books-redirect', () => ({
  __esModule: true,
  default: () => <div data-testid="address-books-redirect" />,
}))

describe('AddressBooks Page', () => {
  describe('basic rendering', () => {
    it('renders the address books redirect component', () => {
      render(<Page />)
      expect(screen.getByTestId('address-books-redirect')).toBeInTheDocument()
    })
  })
})
