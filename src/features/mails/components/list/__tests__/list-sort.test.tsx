import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import ListSort from '../list-sort'

const mockReplace = jest.fn()
const mockUseRouter = jest.fn(() => ({ replace: mockReplace }))
const mockUsePathname = jest.fn(() => '/u/en/INBOX')
const mockUseSearchParams = jest.fn()

const createSearchParams = (initial: Record<string, string> = {}) => {
  const params = new URLSearchParams(initial)
  return {
    get: (key: string) => params.get(key),
    toString: () => params.toString(),
    delete: (key: string) => params.delete(key),
    set: (key: string, value: string) => params.set(key, value),
  }
}

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="sort-button" {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuGroup: ({ children }: any) => (
    <div data-testid="dropdown-group">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
}))

jest.mock('lucide-react/dynamic', () => ({
  DynamicIcon: ({ name }: { name: string }) => (
    <span data-testid="dynamic-icon" data-name={name}>
      {name}
    </span>
  ),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('ListSort component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSearchParams.mockReturnValue(createSearchParams())
  })

  describe('basic rendering', () => {
    it('renders the dropdown trigger button with default icon', () => {
      render(<ListSort />)
      const button = screen.getByTestId('sort-button')
      expect(button).toBeInTheDocument()
      const icons = screen.getAllByTestId('dynamic-icon')
      const triggerIcon = icons.find((icon) =>
        icon.closest('[data-testid="sort-button"]')
      )
      expect(triggerIcon).toHaveAttribute('data-name', 'clock-arrow-down')
    })
  })

  describe('configuration', () => {
    it('lists all sort options with translated labels and icons', () => {
      render(<ListSort />)
      const items = screen.getAllByTestId('dropdown-item')
      const expectedLabels = [
        'MAILS_LIST.sort.date.ascending.string',
        'MAILS_LIST.sort.date.descending.string',
        'MAILS_LIST.sort.size.ascending.string',
        'MAILS_LIST.sort.size.descending.string',
      ]
      expectedLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
      expect(items).toHaveLength(4)
    })
  })

  describe('integration', () => {
    it('updates URL with sort query when selecting descending date', async () => {
      render(<ListSort />)
      const descOption = screen.getByText('MAILS_LIST.sort.date.descending.string')
      fireEvent.click(descOption)
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/u/en/INBOX?sort=t_desc')
      })
    })

    it('removes sort query when selecting ascending date from a sorted state', async () => {
      mockUseSearchParams.mockReturnValue(createSearchParams({ sort: 't_desc' }))
      render(<ListSort />)
      const ascOption = screen.getByText('MAILS_LIST.sort.date.ascending.string')
      fireEvent.click(ascOption)
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/u/en/INBOX?')
      })
    })
  })
})
