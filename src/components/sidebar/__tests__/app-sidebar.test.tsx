import { render, screen } from '@testing-library/react'
import { AppSidebar } from '../app-sidebar'

jest.mock('@/features/mails/hooks/use-expand-sidebar-on-mail-drag', () => ({
  useExpandSidebarOnMailDrag: jest.fn(),
}))

// Mock the UI components
jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, collapsible, ...props }: any) => (
    <div data-testid="sidebar" data-collapsible={collapsible} {...props}>
      {children}
    </div>
  ),
  SidebarContent: ({ children, className, style, ...props }: any) => (
    <div
      data-testid="sidebar-content"
      className={className}
      style={style}
      {...props}
    >
      {children}
    </div>
  ),
  SidebarFooter: ({ children, className, ...props }: any) => (
    <div data-testid="sidebar-footer" className={className} {...props}>
      {children}
    </div>
  ),
  SidebarHeader: ({ children, className, ...props }: any) => (
    <div data-testid="sidebar-header" className={className} {...props}>
      {children}
    </div>
  ),
  SidebarTrigger: ({ className, ...props }: any) => (
    <button data-testid="sidebar-trigger" className={className} {...props}>
      Toggle Sidebar
    </button>
  ),
}))

// Mock the SidebarsContent component
jest.mock('../app-sidebar-content', () => {
  return function MockSidebarsContent() {
    return <div data-testid="sidebars-content">Sidebar Content</div>
  }
})

jest.mock('../app-sidebar-mobile-effects', () => ({
  AppSidebarMobileEffects: () => null,
}))

describe('AppSidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render all sidebar components correctly', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('sidebars-content')).toBeInTheDocument()
    })

    it('should render with correct structure and content', () => {
      render(<AppSidebar />)

      const sidebar = screen.getByTestId('sidebar')
      const content = screen.getByTestId('sidebar-content')
      const footer = screen.getByTestId('sidebar-footer')
      const trigger = screen.getByTestId('sidebar-trigger')

      expect(sidebar).toContainElement(content)
      expect(sidebar).toContainElement(footer)
      expect(footer).toContainElement(trigger)
      expect(content).toContainElement(screen.getByTestId('sidebars-content'))
    })
  })

  describe('sidebar configuration', () => {
    it('should configure sidebar as collapsible with icon mode', () => {
      render(<AppSidebar />)

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveAttribute('data-collapsible', 'icon')
    })

    it('should apply correct CSS classes to header', () => {
      render(<AppSidebar />)

      const header = screen.getByTestId('sidebar-header')
      expect(header).toHaveClass('flex', 'h-29', 'rounded-br-2xl')
    })

    it('should apply correct CSS classes to content', () => {
      render(<AppSidebar />)

      const content = screen.getByTestId('sidebar-content')
      expect(content).toHaveClass(
        'mt-1',
        'overflow-y-auto',
        'p-0',
        'pt-1',
        'group-data-[state=collapsed]:overflow-visible'
      )
    })

    it('should apply correct CSS classes to footer', () => {
      render(<AppSidebar />)

      const footer = screen.getByTestId('sidebar-footer')
      expect(footer).toHaveClass(
        'flex',
        'justify-end',
        'p-0',
        'group-data-[collapsible=icon]:px-1'
      )
    })

    it('should apply correct CSS classes to trigger', () => {
      render(<AppSidebar />)

      const trigger = screen.getByTestId('sidebar-trigger')
      expect(trigger).toHaveClass(
        'mb-2',
        'ml-auto',
        'h-10',
        'w-15',
        'rounded-r-none',
        'group-data-[collapsible=icon]:ml-0',
        'group-data-[collapsible=icon]:w-full',
        'group-data-[collapsible=icon]:rounded-md'
      )
    })
  })

  describe('custom styling', () => {
    it('should apply custom scrollbar styles to content', () => {
      render(<AppSidebar />)

      const content = screen.getByTestId('sidebar-content')
      const styles = content.style

      expect(styles.scrollbarWidth).toBe('thin')
      expect(styles.scrollbarColor).toBe(
        'hsl(var(--sidebar-foreground) / 0.35) transparent'
      )
      expect(styles.scrollbarGutter).toBe('stable')
    })
  })

  describe('accessibility', () => {
    it('should render trigger button for keyboard/screen reader access', () => {
      render(<AppSidebar />)

      const trigger = screen.getByTestId('sidebar-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('should have proper semantic structure', () => {
      render(<AppSidebar />)

      // Check that all required sections are present
      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should include the SidebarsContent component', () => {
      render(<AppSidebar />)

      expect(screen.getByTestId('sidebars-content')).toBeInTheDocument()
      expect(screen.getByText('Sidebar Content')).toBeInTheDocument()
    })
  })

  describe('component stability', () => {
    it('should render consistently across multiple renders', () => {
      const { rerender } = render(<AppSidebar />)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('sidebars-content')).toBeInTheDocument()

      rerender(<AppSidebar />)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('sidebars-content')).toBeInTheDocument()
    })

    it('should maintain all styling properties on re-render', () => {
      const { rerender } = render(<AppSidebar />)

      const content = screen.getByTestId('sidebar-content')
      const initialStyles = {
        scrollbarWidth: content.style.scrollbarWidth,
        scrollbarColor: content.style.scrollbarColor,
        scrollbarGutter: content.style.scrollbarGutter,
      }

      rerender(<AppSidebar />)

      const rerenderedContent = screen.getByTestId('sidebar-content')
      expect(rerenderedContent.style.scrollbarWidth).toBe(
        initialStyles.scrollbarWidth
      )
      expect(rerenderedContent.style.scrollbarColor).toBe(
        initialStyles.scrollbarColor
      )
      expect(rerenderedContent.style.scrollbarGutter).toBe(
        initialStyles.scrollbarGutter
      )
    })
  })
})
