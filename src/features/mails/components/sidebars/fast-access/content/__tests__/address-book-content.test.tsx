import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AddressBookContent from '../address-book-content'

jest.mock('../feature-incoming', () => ({
  __esModule: true,
  default: () => <div data-testid="feature-incoming" />,
}))

describe('AddressBookContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders FeatureIncoming', () => {
      render(<AddressBookContent />)
      expect(screen.getByTestId('feature-incoming')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('delegates to shared placeholder', () => {
      const { container } = render(<AddressBookContent />)
      expect(
        container.querySelectorAll('[data-testid="feature-incoming"]')
      ).toHaveLength(1)
    })
  })

  describe('component stability', () => {
    it('renders consistently after rerender', () => {
      const { rerender } = render(<AddressBookContent />)
      rerender(<AddressBookContent />)
      expect(screen.getByTestId('feature-incoming')).toBeInTheDocument()
    })
  })
})
