import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import ListPagination from '../list-pagination'

const mockPush = jest.fn()
const mockPathname = '/en/u/0/INBOX'
const mockSearchParams = new URLSearchParams()

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
  usePathname: jest.fn(() => mockPathname),
}))

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => mockSearchParams),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuRadioGroup: ({ children, onValueChange, value }: any) => (
    <div data-testid="radio-group" data-value={value}>
      {children}
    </div>
  ),
  DropdownMenuRadioItem: ({ children, value }: any) => (
    <div data-testid={`radio-item-${value}`}>{children}</div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}))

describe('ListPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key))
    const { useIsMobile } = require('@/hooks/use-mobile')
    useIsMobile.mockReturnValue(false)
  })

  describe('basic rendering', () => {
    it('renders prev and next buttons', () => {
      render(<ListPagination currentPage={1} totalPages={5} />)
      expect(screen.getByRole('button', { name: 'pagination.previous.string' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'pagination.next.string' })).toBeInTheDocument()
    })

    it('renders page indicator on desktop', () => {
      render(<ListPagination currentPage={2} totalPages={5} />)
      expect(screen.getByText('2 / 5')).toBeInTheDocument()
    })

    it('treats totalPages 0 as a single page (1 / 1)', () => {
      render(<ListPagination currentPage={1} totalPages={0} />)
      expect(screen.getByText('1 / 1')).toBeInTheDocument()
    })

    it('does not render page dropdown on mobile', () => {
      const { useIsMobile } = require('@/hooks/use-mobile')
      useIsMobile.mockReturnValue(true)
      render(<ListPagination currentPage={1} totalPages={3} />)
      expect(screen.queryByTestId('dropdown-trigger')).not.toBeInTheDocument()
    })

    it('renders the dropdown trigger with page indicator on desktop', () => {
      render(<ListPagination currentPage={1} totalPages={3} />)
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })
  })

  describe('disabled states', () => {
    it('disables prev button on first page', () => {
      render(<ListPagination currentPage={1} totalPages={5} hasPreviousPage={false} />)
      expect(screen.getByRole('button', { name: 'pagination.previous.string' })).toBeDisabled()
    })

    it('disables next button on last page', () => {
      render(<ListPagination currentPage={5} totalPages={5} hasNextPage={false} />)
      expect(screen.getByRole('button', { name: 'pagination.next.string' })).toBeDisabled()
    })

    it('enables prev button when hasPreviousPage is true', () => {
      render(<ListPagination currentPage={2} totalPages={5} hasPreviousPage={true} />)
      expect(screen.getByRole('button', { name: 'pagination.previous.string' })).not.toBeDisabled()
    })

    it('enables next button when hasNextPage is true', () => {
      render(<ListPagination currentPage={2} totalPages={5} hasNextPage={true} />)
      expect(screen.getByRole('button', { name: 'pagination.next.string' })).not.toBeDisabled()
    })
  })

  describe('navigation — handlePrev', () => {
    it('navigates to page 2 when on page 3', () => {
      mockSearchParams.set('sort', 't_desc')
      render(<ListPagination currentPage={3} totalPages={5} hasPreviousPage={true} />)
      fireEvent.click(screen.getByRole('button', { name: 'pagination.previous.string' }))
      expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?sort=t_desc&page=2`)
    })

    it('removes page param when navigating back to page 1', () => {
      mockSearchParams.set('sort', 't_desc')
      render(<ListPagination currentPage={2} totalPages={5} hasPreviousPage={true} />)
      fireEvent.click(screen.getByRole('button', { name: 'pagination.previous.string' }))
      expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?sort=t_desc`)
    })

    it('does not navigate when already on page 1', () => {
      render(<ListPagination currentPage={1} totalPages={5} hasPreviousPage={false} />)
      fireEvent.click(screen.getByRole('button', { name: 'pagination.previous.string' }))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('navigation — handleNext', () => {
    it('navigates to next page preserving existing params', () => {
      mockSearchParams.set('sort', 't_asc')
      render(<ListPagination currentPage={1} totalPages={5} hasNextPage={true} />)
      fireEvent.click(screen.getByRole('button', { name: 'pagination.next.string' }))
      expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?sort=t_asc&page=2`)
    })

    it('does not navigate when already on last page', () => {
      render(<ListPagination currentPage={5} totalPages={5} hasNextPage={false} />)
      fireEvent.click(screen.getByRole('button', { name: 'pagination.next.string' }))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('prev button has correct aria-label', () => {
      render(<ListPagination currentPage={1} totalPages={3} />)
      expect(screen.getByRole('button', { name: 'pagination.previous.string' })).toBeInTheDocument()
    })

    it('next button has correct aria-label', () => {
      render(<ListPagination currentPage={1} totalPages={3} />)
      expect(screen.getByRole('button', { name: 'pagination.next.string' })).toBeInTheDocument()
    })

    it('prev button has aria-disabled when on page 1', () => {
      render(<ListPagination currentPage={1} totalPages={3} />)
      expect(screen.getByRole('button', { name: 'pagination.previous.string' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    })
  })

  describe('component stability', () => {
    it('updates page indicator on re-render', () => {
      const { rerender } = render(
        <ListPagination currentPage={1} totalPages={3} hasNextPage={true} hasPreviousPage={false} />
      )
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
      rerender(
        <ListPagination currentPage={2} totalPages={3} hasNextPage={true} hasPreviousPage={true} />
      )
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })
  })
})
