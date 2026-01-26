import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import AddAddressBook from '../add'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock RTK Query
jest.mock('@/features/address_books/store/address-books-api', () => ({
  useAddAddressBookMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}))

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
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
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
  DialogClose: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-close">{children}</div>
  ),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroupAction: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-action">{children}</div>
  ),
}))

describe('AddAddressBook', () => {
  it('should render without crashing', () => {
    render(<AddAddressBook type="personals" />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render dialog trigger', () => {
    render(<AddAddressBook type="personals" />)
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
  })

  it('should use translations', () => {
    render(<AddAddressBook type="personals" />)
    expect(useTranslations).toHaveBeenCalledWith('FORM_COMMONS')
    expect(useTranslations).toHaveBeenCalledWith('ADDRESS_BOOKS_SIDEBAR')
  })
})
