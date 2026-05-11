import { usePathname, useRouter } from '@/lib/i18n/navigation'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import ListFilterDropdown from '../list-filter-dropdown'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/components/ui/select', () => ({
  Select: jest.fn(({ children, onValueChange, value }) => (
    <div data-testid="select-root">
      {children}
      <input
        data-testid="select-input"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </div>
  )),
  SelectTrigger: jest.fn(({ children }) => (
    <button type="button" data-testid="select-trigger">
      {children}
    </button>
  )),
  SelectValue: jest.fn(() => <span data-testid="select-value">All</span>),
  SelectContent: jest.fn(({ children }) => (
    <div data-testid="select-content">{children}</div>
  )),
  SelectItem: jest.fn(({ children, value }) => (
    <option data-testid={`select-item-${value}`} value={value}>
      {children}
    </option>
  )),
}))

describe('ListFilterDropdown Component', () => {
  const mockPush = jest.fn()
  const mockTranslate = jest.fn((key) => {
    const translations: Record<string, string> = {
      'filter.all.string': 'All',
      'filter.read.string': 'Read',
      'filter.unread.string': 'Unread',
      'filter.starred.string': 'Starred',
      'filter.attachments.string': 'Attachments',
      'filter.client_scope_notice.string':
        'Filters apply only to messages loaded on this page.',
    }
    return translations[key] || key
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(usePathname as jest.Mock).mockReturnValue('/u/test@example.com/inbox')
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
  })

  it('should render select component', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=all')
    )

    render(<ListFilterDropdown />)
    expect(screen.getByTestId('select-root')).toBeInTheDocument()
  })

  it('should default to "all" filter when no filter is specified', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''))

    render(<ListFilterDropdown />)
    const input = screen.getByTestId('select-input') as HTMLInputElement
    expect(input.value).toBe('all')
  })

  it('should display current filter value', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=unread')
    )

    render(<ListFilterDropdown />)
    const input = screen.getByTestId('select-input') as HTMLInputElement
    expect(input.value).toBe('unread')
  })

  it('should render all filter options', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=all')
    )

    render(<ListFilterDropdown />)
    expect(screen.getByTestId('select-item-all')).toBeInTheDocument()
    expect(screen.getByTestId('select-item-read')).toBeInTheDocument()
    expect(screen.getByTestId('select-item-unread')).toBeInTheDocument()
    expect(screen.getByTestId('select-item-starred')).toBeInTheDocument()
    expect(screen.getByTestId('select-item-attachments')).toBeInTheDocument()
  })

  it('should navigate to path without query when "all" is selected', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=unread')
    )

    render(<ListFilterDropdown />)
    const input = screen.getByTestId('select-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'all' } })

    expect(mockPush).toHaveBeenCalledWith('/u/test@example.com/inbox')
  })

  it('should navigate with filter query parameter when non-all filter is selected', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=all')
    )

    render(<ListFilterDropdown />)
    const input = screen.getByTestId('select-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'starred' } })

    expect(mockPush).toHaveBeenCalledWith('?filter=starred')
  })

  it('should handle filter change for "read"', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=all')
    )

    render(<ListFilterDropdown />)
    const input = screen.getByTestId('select-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'read' } })

    expect(mockPush).toHaveBeenCalledWith('?filter=read')
  })

  it('should handle filter change for "unread"', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=all')
    )

    render(<ListFilterDropdown />)
    const input = screen.getByTestId('select-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'unread' } })

    expect(mockPush).toHaveBeenCalledWith('?filter=unread')
  })

  it('should handle filter change for "attachments"', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=all')
    )

    render(<ListFilterDropdown />)
    const input = screen.getByTestId('select-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'attachments' } })

    expect(mockPush).toHaveBeenCalledWith('?filter=attachments')
  })

  it('should translate filter labels', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=all')
    )

    render(<ListFilterDropdown />)

    expect(mockTranslate).toHaveBeenCalledWith('filter.all.string')
    expect(mockTranslate).toHaveBeenCalledWith('filter.read.string')
    expect(mockTranslate).toHaveBeenCalledWith('filter.unread.string')
  })

  it('should handle empty filter value by defaulting to all', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=')
    )

    render(<ListFilterDropdown />)
    const input = screen.getByTestId('select-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: '' } })

    expect(mockPush).toHaveBeenCalledWith('/u/test@example.com/inbox')
  })

  it('shows client-side filter scope notice when filter is not all', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('filter=unread')
    )

    render(<ListFilterDropdown />)
    expect(
      screen.getByText(
        'Filters apply only to messages loaded on this page.'
      )
    ).toBeInTheDocument()
  })
})
