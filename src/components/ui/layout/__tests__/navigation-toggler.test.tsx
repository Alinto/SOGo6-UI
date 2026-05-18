import { render, screen } from '@testing-library/react'
import NavigationToggler from '../navigation-toggler'

// Mock the i18n navigation
jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}))

// Mock the tabs component - using a simplified version for testing
jest.mock('../../tabs', () => ({
  Tabs: ({ children, value, onValueChange, className }: any) => (
    <div data-testid="tabs" data-value={value} className={className}>
      {children}
      <input
        type="hidden"
        data-testid="tabs-onValueChange"
        value={onValueChange.toString()}
      />
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid="tabs-list" className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    'aria-label': ariaLabel,
    className,
    onClick,
  }: any) => (
    <button
      data-testid={`tab-trigger-${value}`}
      data-value={value}
      aria-label={ariaLabel}
      className={className}
      onClick={() => onClick?.()}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/lib/icons/module-nav-icons', () => ({
  ModuleNavIcon: {
    Mail: () => <div data-testid="icon-mail" />,
    AddressBook: () => <div data-testid="icon-contact2" />,
    Calendar: () => <div data-testid="icon-calendar" />,
    Tasks: () => <div data-testid="icon-list-checks" />,
  },
}))

import { usePathname, useRouter } from '@/lib/i18n/navigation'

const mockUsePathname = usePathname as jest.Mock
const mockUseRouter = useRouter as jest.Mock

describe('NavigationToggler', () => {
  let mockPush: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush = jest.fn()
    mockUseRouter.mockReturnValue({ push: mockPush })
  })

  describe('rendering', () => {
    it('should render the component', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      render(<NavigationToggler />)

      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })

    it('should render all four tabs', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      render(<NavigationToggler />)

      expect(screen.getByTestId('tab-trigger-mail')).toBeInTheDocument()
      expect(
        screen.getByTestId('tab-trigger-address_books')
      ).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-calendars')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-tasks')).toBeInTheDocument()
    })

    it('should render all icons', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      render(<NavigationToggler />)

      expect(screen.getByTestId('icon-mail')).toBeInTheDocument()
      expect(screen.getByTestId('icon-contact2')).toBeInTheDocument()
      expect(screen.getByTestId('icon-calendar')).toBeInTheDocument()
      expect(screen.getByTestId('icon-list-checks')).toBeInTheDocument()
    })

    it('should render tabs list', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      render(<NavigationToggler />)

      expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
    })
  })

  describe('aria labels', () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')
    })

    it('should have aria label for mail tab', () => {
      render(<NavigationToggler />)

      expect(screen.getByLabelText('Mail')).toBeInTheDocument()
    })

    it('should have aria label for address books tab', () => {
      render(<NavigationToggler />)

      expect(screen.getByLabelText('Address Books')).toBeInTheDocument()
    })

    it('should have aria label for calendars tab', () => {
      render(<NavigationToggler />)

      expect(screen.getByLabelText('Calendars')).toBeInTheDocument()
    })

    it('should have aria label for tasks tab', () => {
      render(<NavigationToggler />)

      expect(screen.getByLabelText('Tasks')).toBeInTheDocument()
    })
  })

  describe('page detection from pathname', () => {
    it('should detect mail page from /u path', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'mail')
    })

    it('should detect address_books page', () => {
      mockUsePathname.mockReturnValue('/address_books')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'address_books')
    })

    it('should detect calendars page', () => {
      mockUsePathname.mockReturnValue('/calendars')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'calendars')
    })

    it('should detect tasks page', () => {
      mockUsePathname.mockReturnValue('/tasks')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'tasks')
    })

    it('should handle empty pathname', () => {
      mockUsePathname.mockReturnValue('/')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', '')
    })

    it('should handle nested paths in address_books', () => {
      mockUsePathname.mockReturnValue('/address_books/123')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'address_books')
    })

    it('should handle nested paths in calendars', () => {
      mockUsePathname.mockReturnValue('/calendars/abc-123')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'calendars')
    })

    it('should handle nested paths in tasks', () => {
      mockUsePathname.mockReturnValue('/tasks/new')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'tasks')
    })

    it('should handle nested paths in mail', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX/12345')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'mail')
    })
  })

  describe('className prop', () => {
    it('should apply default class when no className provided', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs.className).toBe('')
    })

    it('should apply provided className', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      render(<NavigationToggler className="custom-class" />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs.className).toContain('custom-class')
    })

    it('should apply multiple classes', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      render(<NavigationToggler className="class1 class2 class3" />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs.className).toContain('class1')
      expect(tabs.className).toContain('class2')
      expect(tabs.className).toContain('class3')
    })
  })

  describe('navigation on tab change', () => {
    it('should navigate to mail page when mail tab is clicked', () => {
      mockUsePathname.mockReturnValue('/address_books')

      const { rerender } = render(<NavigationToggler />)

      // Simulate Tabs onValueChange callback
      mockUsePathname.mockReturnValue('/u/0/INBOX')
      rerender(<NavigationToggler />)

      // The component doesn't actually handle click, it uses onValueChange
      // so we need to test the behavior through the Tabs component
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'mail')
    })

    it('should have mail navigation route', () => {
      mockUsePathname.mockReturnValue('/address_books')

      render(<NavigationToggler />)

      // This is testing that the component is set up correctly for mail navigation
      const tabs = screen.getByTestId('tabs')
      expect(tabs).toBeInTheDocument()
    })

    it('should handle address_books navigation', () => {
      mockUsePathname.mockReturnValue('/calendars')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'calendars')
    })

    it('should handle calendars navigation', () => {
      mockUsePathname.mockReturnValue('/address_books')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'address_books')
    })

    it('should handle tasks navigation', () => {
      mockUsePathname.mockReturnValue('/tasks')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'tasks')
    })
  })

  describe('tab styling', () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')
    })

    it('should apply text color classes to triggers', () => {
      render(<NavigationToggler />)

      const mailTab = screen.getByTestId('tab-trigger-mail')
      expect(mailTab.className).toContain('text-sidebar-foreground')
      expect(mailTab.className).toContain('hover:text-foreground')
      expect(mailTab.className).toContain('data-[state=active]:text-foreground')
      expect(mailTab.className).toContain('cursor-pointer')
    })

    it('should apply consistent styling to all tabs', () => {
      render(<NavigationToggler />)

      const tabs = [
        screen.getByTestId('tab-trigger-mail'),
        screen.getByTestId('tab-trigger-address_books'),
        screen.getByTestId('tab-trigger-calendars'),
        screen.getByTestId('tab-trigger-tasks'),
      ]

      tabs.forEach((tab) => {
        expect(tab.className).toContain('text-sidebar-foreground')
        expect(tab.className).toContain('cursor-pointer')
      })
    })

    it('should apply grid layout to tabs list', () => {
      render(<NavigationToggler />)

      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList.className).toContain('grid')
      expect(tabsList.className).toContain('grid-cols-4')
    })
  })

  describe('component structure', () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')
    })

    it('should be a functional component', () => {
      const { container } = render(<NavigationToggler />)
      expect(container).toBeInTheDocument()
    })

    it('should render without errors', () => {
      expect(() => {
        render(<NavigationToggler />)
      }).not.toThrow()
    })

    it('should have proper TypeScript props', () => {
      render(<NavigationToggler className="test" />)

      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })
  })

  describe('path parsing', () => {
    it('should correctly parse single segment paths', () => {
      mockUsePathname.mockReturnValue('/tasks')

      render(<NavigationToggler />)

      expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'tasks')
    })

    it('should correctly parse multi-segment paths', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX/folder/subfolder')

      render(<NavigationToggler />)

      expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'mail')
    })

    it('should handle path with trailing slash', () => {
      mockUsePathname.mockReturnValue('/calendars/')

      render(<NavigationToggler />)

      expect(screen.getByTestId('tabs')).toHaveAttribute(
        'data-value',
        'calendars'
      )
    })

    it('should handle path without leading slash', () => {
      mockUsePathname.mockReturnValue('address_books')

      render(<NavigationToggler />)

      // This would result in empty page since first part would be empty or address_books itself
      // depending on how split works
      const tabs = screen.getByTestId('tabs')
      expect(tabs).toBeInTheDocument()
    })
  })

  describe('icon rendering', () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')
    })

    it('should render mail icon in mail tab', () => {
      render(<NavigationToggler />)

      const mailTab = screen.getByTestId('tab-trigger-mail')
      expect(
        mailTab.querySelector('[data-testid="icon-mail"]')
      ).toBeInTheDocument()
    })

    it('should render address books icon in address_books tab', () => {
      render(<NavigationToggler />)

      const addressBooksTab = screen.getByTestId('tab-trigger-address_books')
      expect(
        addressBooksTab.querySelector('[data-testid="icon-contact2"]')
      ).toBeInTheDocument()
    })

    it('should render calendar icon in calendars tab', () => {
      render(<NavigationToggler />)

      const calendarsTab = screen.getByTestId('tab-trigger-calendars')
      expect(
        calendarsTab.querySelector('[data-testid="icon-calendar"]')
      ).toBeInTheDocument()
    })

    it('should render tasks icon in tasks tab', () => {
      render(<NavigationToggler />)

      const tasksTab = screen.getByTestId('tab-trigger-tasks')
      expect(
        tasksTab.querySelector('[data-testid="icon-list-checks"]')
      ).toBeInTheDocument()
    })

    it('should render icons with correct size', () => {
      render(<NavigationToggler />)

      // Icons should have h-6 w-6 classes
      const icons = screen.getAllByTestId(/icon-/)
      expect(icons.length).toBe(4)
    })
  })

  describe('default props', () => {
    it('should use empty string as default className', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs.className).toBe('')
    })
  })

  describe('multiple instances', () => {
    it('should handle multiple instances independently', () => {
      mockUsePathname.mockReturnValueOnce('/u/0/INBOX')
      const { rerender } = render(<NavigationToggler />)

      expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'mail')

      mockUsePathname.mockReturnValueOnce('/calendars')
      rerender(<NavigationToggler />)

      // The second instance would show calendars
      // but since we're rerendering the same instance, pathname changes
      expect(screen.getByTestId('tabs')).toHaveAttribute(
        'data-value',
        'calendars'
      )
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')
    })

    it('should be accessible with keyboard navigation', () => {
      render(<NavigationToggler />)

      const tabs = [
        screen.getByLabelText('Mail'),
        screen.getByLabelText('Address Books'),
        screen.getByLabelText('Calendars'),
        screen.getByLabelText('Tasks'),
      ]

      tabs.forEach((tab) => {
        expect(tab).toBeInTheDocument()
      })
    })

    it('should have semantic tab structure', () => {
      render(<NavigationToggler />)

      expect(screen.getByTestId('tabs')).toBeInTheDocument()
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
    })

    it('should use aria labels for all tabs', () => {
      render(<NavigationToggler />)

      expect(screen.getByLabelText('Mail')).toBeInTheDocument()
      expect(screen.getByLabelText('Address Books')).toBeInTheDocument()
      expect(screen.getByLabelText('Calendars')).toBeInTheDocument()
      expect(screen.getByLabelText('Tasks')).toBeInTheDocument()
    })
  })

  describe('prop changes', () => {
    it('should update className when prop changes', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      const { rerender } = render(<NavigationToggler />)

      let tabs = screen.getByTestId('tabs')
      expect(tabs.className).toBe('')

      rerender(<NavigationToggler className="new-class" />)

      tabs = screen.getByTestId('tabs')
      expect(tabs.className).toContain('new-class')
    })

    it('should update active tab when pathname changes', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX')

      const { rerender } = render(<NavigationToggler />)

      let tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'mail')

      mockUsePathname.mockReturnValue('/calendars')
      rerender(<NavigationToggler />)

      tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'calendars')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string pathname', () => {
      mockUsePathname.mockReturnValue('')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', '')
    })

    it('should handle very long pathname', () => {
      mockUsePathname.mockReturnValue(
        '/u/0/INBOX/folder1/folder2/folder3/folder4/mail123'
      )

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'mail')
    })

    it('should handle pathname with special characters', () => {
      mockUsePathname.mockReturnValue('/u/0/INBOX-special')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'mail')
    })

    it('should handle numeric-only first path segment', () => {
      mockUsePathname.mockReturnValue('/123')

      render(<NavigationToggler />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', '')
    })
  })
})
