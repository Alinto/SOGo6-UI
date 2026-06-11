import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../page'

jest.mock(
  '@/features/address_books/components/visualization/contact-selection-placeholder',
  () => ({
    __esModule: true,
    default: () => <div data-testid="contact-selection-placeholder" />,
  })
)

describe('AddressBook visualization default Page', () => {
  describe('basic rendering', () => {
    it('renders contact selection placeholder', () => {
      render(<Page />)
      expect(screen.getByTestId('contact-selection-placeholder')).toBeInTheDocument()
    })
  })
})
