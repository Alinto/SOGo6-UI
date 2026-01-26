import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import EditForm from '../edit'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock RTK Query
jest.mock('@/features/address_books/store/address-books-api', () => ({
  useUpdateAddressBookMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}))

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  DialogClose: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-close">{children}</div>
  ),
}))

describe('EditForm', () => {
  const defaultProps = {
    id: '123',
    name: 'Test Address Book',
  }

  it('should render without crashing', () => {
    render(<EditForm {...defaultProps} />)
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
  })

  it('should render dialog title', () => {
    render(<EditForm {...defaultProps} />)
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
  })

  it('should use translations', () => {
    render(<EditForm {...defaultProps} />)
    expect(useTranslations).toHaveBeenCalledWith('FORM_COMMONS')
    expect(useTranslations).toHaveBeenCalledWith('ADDRESS_BOOKS_SIDEBAR')
  })

  it('should accept optional onSuccess prop', () => {
    const onSuccess = jest.fn()
    render(<EditForm {...defaultProps} onSuccess={onSuccess} />)
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
  })
})
