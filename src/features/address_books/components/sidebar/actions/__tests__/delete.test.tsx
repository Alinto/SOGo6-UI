import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import DeleteAction from '../delete'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock RTK Query
jest.mock('@/features/address_books/store/address-books-api', () => ({
  useDeleteAddressBookMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}))

// Mock i18n navigation hooks
const mockPush = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}))

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  DialogClose: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-close">{children}</div>
  ),
}))

describe('DeleteAction', () => {
  const defaultProps = {
    id: '123',
    name: 'Test Address Book',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<DeleteAction {...defaultProps} />)
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
  })

  it('should render dialog title', () => {
    render(<DeleteAction {...defaultProps} />)
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
  })

  it('should use translations', () => {
    render(<DeleteAction {...defaultProps} />)
    expect(useTranslations).toHaveBeenCalledWith('FORM_COMMONS')
    expect(useTranslations).toHaveBeenCalledWith('ADDRESS_BOOKS_SIDEBAR')
  })
})
