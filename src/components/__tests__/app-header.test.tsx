import { render, screen } from '@testing-library/react'
import AppHeader from '../app-header'

// Mock the hooks and components used by AppHeader
const mockUseIsMobile = jest.fn()

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}))

jest.mock('@/features/mails/components/search', () => ({
  Search: () => <div data-testid="search-component">Search Component</div>,
}))

jest.mock('../ui/header-dropdown', () => {
  return function HeaderDropdown() {
    return <div data-testid="header-dropdown">Header Dropdown</div>
  }
})

jest.mock('../ui/sidebar', () => ({
  SidebarTrigger: () => (
    <div data-testid="sidebar-trigger">Sidebar Trigger</div>
  ),
}))

describe('AppHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the header with basic structure', () => {
    mockUseIsMobile.mockReturnValue(false)

    render(<AppHeader />)

    // Check that the header element exists
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass(
      'bg-header',
      'text-header-foreground',
      'top-0',
      'right-0',
      'left-0',
      'z-10',
      'flex',
      'h-12'
    )
  })

  it('should render Search component', () => {
    mockUseIsMobile.mockReturnValue(false)

    render(<AppHeader />)

    expect(screen.getByTestId('search-component')).toBeInTheDocument()
    expect(screen.getByText('Search Component')).toBeInTheDocument()
  })

  it('should render HeaderDropdown component', () => {
    mockUseIsMobile.mockReturnValue(false)

    render(<AppHeader />)

    expect(screen.getByTestId('header-dropdown')).toBeInTheDocument()
    expect(screen.getByText('Header Dropdown')).toBeInTheDocument()
  })

  it('should show SidebarTrigger when on mobile', () => {
    mockUseIsMobile.mockReturnValue(true)

    render(<AppHeader />)

    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
    expect(screen.getByText('Sidebar Trigger')).toBeInTheDocument()
  })

  it('should not show SidebarTrigger when not on mobile', () => {
    mockUseIsMobile.mockReturnValue(false)

    render(<AppHeader />)

    expect(screen.queryByTestId('sidebar-trigger')).not.toBeInTheDocument()
    expect(screen.queryByText('Sidebar Trigger')).not.toBeInTheDocument()
  })

  it('should have correct layout structure', () => {
    mockUseIsMobile.mockReturnValue(false)

    render(<AppHeader />)

    // Check search container has correct classes
    const searchContainer = screen.getByTestId('search-component').parentElement
    expect(searchContainer).toHaveClass('ml-2', 'w-1/2', 'xl:w-1/3')

    // Check header dropdown container has correct classes
    const dropdownContainer =
      screen.getByTestId('header-dropdown').parentElement
    expect(dropdownContainer).toHaveClass('mr-3')
  })

  describe('responsive behavior', () => {
    it('should adapt layout for mobile devices', () => {
      mockUseIsMobile.mockReturnValue(true)

      render(<AppHeader />)

      // Should show sidebar trigger on mobile
      expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()

      // Should still show search and dropdown
      expect(screen.getByTestId('search-component')).toBeInTheDocument()
      expect(screen.getByTestId('header-dropdown')).toBeInTheDocument()
    })

    it('should adapt layout for desktop devices', () => {
      mockUseIsMobile.mockReturnValue(false)

      render(<AppHeader />)

      // Should not show sidebar trigger on desktop
      expect(screen.queryByTestId('sidebar-trigger')).not.toBeInTheDocument()

      // Should still show search and dropdown
      expect(screen.getByTestId('search-component')).toBeInTheDocument()
      expect(screen.getByTestId('header-dropdown')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should use semantic header element', () => {
      mockUseIsMobile.mockReturnValue(false)

      render(<AppHeader />)

      const header = screen.getByRole('banner')
      expect(header.tagName).toBe('HEADER')
    })

    it('should have proper structure for screen readers', () => {
      mockUseIsMobile.mockReturnValue(false)

      render(<AppHeader />)

      // The header should be identifiable by screen readers
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have all required CSS classes', () => {
      mockUseIsMobile.mockReturnValue(false)

      render(<AppHeader />)

      const header = screen.getByRole('banner')

      // Check for all the expected classes
      const expectedClasses = [
        'bg-header',
        'text-header-foreground',
        'top-0',
        'right-0',
        'left-0',
        'z-10',
        'flex',
        'h-12',
        'shrink-0',
        'items-center',
        'justify-between',
        'gap-2',
      ]

      expectedClasses.forEach((className) => {
        expect(header).toHaveClass(className)
      })
    })

    it('should have transition classes for animations', () => {
      mockUseIsMobile.mockReturnValue(false)

      render(<AppHeader />)

      const header = screen.getByRole('banner')
      expect(header).toHaveClass('transition-[width,height]', 'ease-linear')
    })
  })
})
