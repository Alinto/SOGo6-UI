import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import ListFilter from '../list-filter'

const mockPush = jest.fn()
const mockUsePathname = jest.fn(() => '/en/u/0/INBOX')
const mockUseSearchParams = jest.fn(() => ({
  get: (key: string) => (key === 'filter' ? 'all' : null),
}))
const mockUseAppDispatch = jest.fn(() => jest.fn())
const mockUseAppSelector = jest.fn(() => 'full')
const mockUseIsMobile = jest.fn(() => false)

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockUseAppDispatch(),
  useAppSelector: (fn: (s: any) => string) => fn({ mailLayout: { mode: 'full' } }),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}))

jest.mock('@/components/ui/toggle-group', () => ({
  ToggleGroup: ({ children, onValueChange, value }: any) => (
    <div data-testid="toggle-group" data-value={value}>
      {React.Children.map(children, (child: any) =>
        child?.props?.value
          ? React.cloneElement(child, {
              onClick: () => onValueChange?.(child.props.value),
            })
          : child
      )}
    </div>
  ),
  ToggleGroupItem: ({ children, value, ...props }: any) => (
    <button data-testid={`toggle-${value}`} data-value={value} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/tooltip', () => ({
  TooltipWrapper: ({ children }: any) => <div>{children}</div>,
}))

describe('ListFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/en/u/0/INBOX')
    mockUseSearchParams.mockReturnValue({
      get: (key: string) => (key === 'filter' ? 'all' : null),
    })
  })

  describe('basic rendering', () => {
    it('renders filter toggle group', () => {
      render(<ListFilter />)
      const toggleGroups = screen.getAllByTestId('toggle-group')
      expect(toggleGroups.length).toBeGreaterThan(0)
    })

    it('renders All filter option', () => {
      render(<ListFilter />)
      expect(screen.getByText('filter.all.string')).toBeInTheDocument()
    })

    it('renders Read, Unread, Starred, Attachments options', () => {
      render(<ListFilter />)
      expect(screen.getByText('filter.read.string')).toBeInTheDocument()
      expect(screen.getByText('filter.unread.string')).toBeInTheDocument()
      expect(screen.getByText('filter.starred.string')).toBeInTheDocument()
      expect(screen.getByText('filter.attachments.string')).toBeInTheDocument()
    })

    it('renders layout toggle when not mobile', () => {
      mockUseIsMobile.mockReturnValue(false)
      render(<ListFilter />)
      const fullToggle = screen.queryByTestId('toggle-full')
      const splitToggle = screen.queryByTestId('toggle-split')
      expect(fullToggle || splitToggle).toBeTruthy()
    })

    it('hides layout toggle on mobile', () => {
      mockUseIsMobile.mockReturnValue(true)
      render(<ListFilter />)
      expect(screen.queryByTestId('toggle-full')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('filter items have aria-label', () => {
      render(<ListFilter />)
      const allBtn = screen.getByText('filter.all.string')
      expect(allBtn.closest('button') || allBtn).toHaveAttribute(
        'aria-label',
        'filter.all.string'
      )
    })
  })
})
