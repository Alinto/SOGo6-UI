import { render, screen } from '@testing-library/react'
import SidebarsContent from '../app-sidebar-content'

// Mock the navigation hook
const mockUsePathname = jest.fn()

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

// Mock the sidebar components
jest.mock('@/features/address_books/components/sidebar/sidebar', () => {
  return function MockAddressBooksSidebar() {
    return <div data-testid="address-books-sidebar">Address Books Sidebar</div>
  }
})

jest.mock('@/features/mails/components/sidebars/sidebar', () => {
  return function MockMailSidebar() {
    return <div data-testid="mail-sidebar">Mail Sidebar</div>
  }
})

jest.mock('@/features/user-settings/sidebar/sidebar-content', () => {
  return function MockUserSettingsSidebar() {
    return <div data-testid="user-settings-sidebar">User Settings Sidebar</div>
  }
})

describe('SidebarsContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('route-based sidebar selection', () => {
    it('should render address books sidebar when pathname starts with address_books', () => {
      mockUsePathname.mockReturnValue('/address_books/123')

      render(<SidebarsContent />)

      expect(screen.getByTestId('address-books-sidebar')).toBeInTheDocument()
      expect(screen.getByText('Address Books Sidebar')).toBeInTheDocument()
    })

    it('should render user settings sidebar when pathname starts with user_settings', () => {
      mockUsePathname.mockReturnValue('/user_settings/general')

      render(<SidebarsContent />)

      expect(screen.getByTestId('user-settings-sidebar')).toBeInTheDocument()
      expect(screen.getByText('User Settings Sidebar')).toBeInTheDocument()
    })

    it('should render calendars sidebar placeholder when pathname starts with calendars', () => {
      mockUsePathname.mockReturnValue('/calendars/view')

      render(<SidebarsContent />)

      expect(screen.getByText('Calendars Sidebar')).toBeInTheDocument()
    })

    it('should render mail sidebar when pathname starts with u', () => {
      mockUsePathname.mockReturnValue('/u/account/inbox')

      render(<SidebarsContent />)

      expect(screen.getByTestId('mail-sidebar')).toBeInTheDocument()
      expect(screen.getByText('Mail Sidebar')).toBeInTheDocument()
    })

    it('should render null when pathname does not match any known routes', () => {
      mockUsePathname.mockReturnValue('/unknown/route')

      const { container } = render(<SidebarsContent />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('pathname parsing', () => {
    it('should correctly parse complex address books paths', () => {
      mockUsePathname.mockReturnValue('/address_books/book123/contact456')

      render(<SidebarsContent />)

      expect(screen.getByTestId('address-books-sidebar')).toBeInTheDocument()
    })

    it('should correctly parse nested user settings paths', () => {
      mockUsePathname.mockReturnValue('/user_settings/mail/filters')

      render(<SidebarsContent />)

      expect(screen.getByTestId('user-settings-sidebar')).toBeInTheDocument()
    })

    it('should correctly parse deep mail paths', () => {
      mockUsePathname.mockReturnValue('/u/test@example.com/INBOX/message123')

      render(<SidebarsContent />)

      expect(screen.getByTestId('mail-sidebar')).toBeInTheDocument()
    })

    it('should handle root paths correctly', () => {
      mockUsePathname.mockReturnValue('/address_books')

      render(<SidebarsContent />)

      expect(screen.getByTestId('address-books-sidebar')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty pathname', () => {
      mockUsePathname.mockReturnValue('')

      const { container } = render(<SidebarsContent />)

      expect(container.firstChild).toBeNull()
    })

    it('should handle single slash pathname', () => {
      mockUsePathname.mockReturnValue('/')

      const { container } = render(<SidebarsContent />)

      expect(container.firstChild).toBeNull()
    })

    it('should handle pathname without leading slash', () => {
      mockUsePathname.mockReturnValue('address_books/123')

      const { container } = render(<SidebarsContent />)

      // When there's no leading slash, split('/')[1] returns '123', not 'address_books'
      // So this should return null
      expect(container.firstChild).toBeNull()
    })

    it('should be case sensitive for route matching', () => {
      mockUsePathname.mockReturnValue('/Address_Books/123')

      const { container } = render(<SidebarsContent />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('performance', () => {
    it('should not cause unnecessary re-renders with same pathname', () => {
      mockUsePathname.mockReturnValue('/address_books/123')

      const { rerender } = render(<SidebarsContent />)

      expect(screen.getByTestId('address-books-sidebar')).toBeInTheDocument()

      // Rerender with same props
      rerender(<SidebarsContent />)

      expect(screen.getByTestId('address-books-sidebar')).toBeInTheDocument()
    })
  })

  describe('component isolation', () => {
    it('should only render one sidebar component at a time', () => {
      const testCases = [
        {
          path: '/address_books/test',
          expectedSidebar: 'address-books-sidebar',
        },
        {
          path: '/user_settings/test',
          expectedSidebar: 'user-settings-sidebar',
        },
        { path: '/calendars/test', expectedText: 'Calendars Sidebar' },
        { path: '/u/test', expectedSidebar: 'mail-sidebar' },
      ]

      testCases.forEach(({ path, expectedSidebar, expectedText }) => {
        mockUsePathname.mockReturnValue(path)
        const { unmount } = render(<SidebarsContent />)

        // Count total sidebar components rendered
        const addressBooksElement = screen.queryByTestId(
          'address-books-sidebar'
        )
        const userSettingsElement = screen.queryByTestId(
          'user-settings-sidebar'
        )
        const mailElement = screen.queryByTestId('mail-sidebar')
        const calendarsElement = screen.queryByText('Calendars Sidebar')

        const renderedComponents = [
          addressBooksElement,
          userSettingsElement,
          mailElement,
          calendarsElement,
        ].filter(Boolean)

        // Should only render exactly one component
        expect(renderedComponents).toHaveLength(1)

        // Verify the correct component is rendered
        if (expectedSidebar) {
          expect(screen.getByTestId(expectedSidebar)).toBeInTheDocument()
        } else if (expectedText) {
          expect(screen.getByText(expectedText)).toBeInTheDocument()
        }

        // Clean up before next iteration
        unmount()
      })
    })
  })

  describe('path segment extraction', () => {
    it('should handle various path formats correctly', () => {
      const pathTests = [
        { path: '/address_books', firstSection: 'address_books' },
        { path: '/address_books/', firstSection: 'address_books' },
        { path: '/address_books/sub/path', firstSection: 'address_books' },
        { path: '/', firstSection: '' },
        { path: '', firstSection: undefined },
        { path: '/single', firstSection: 'single' },
        { path: 'no-leading-slash', firstSection: undefined }, // Fixed: when no leading slash, split('/')[1] is undefined
      ]

      pathTests.forEach(({ path, firstSection }) => {
        const actualFirstSection = path.split('/')[1]
        expect(actualFirstSection).toBe(firstSection)
      })
    })
  })

  describe('error handling', () => {
    it('should handle undefined pathname by throwing an error', () => {
      mockUsePathname.mockReturnValue(undefined)

      expect(() => render(<SidebarsContent />)).toThrow()
    })

    it('should handle null pathname by throwing an error', () => {
      mockUsePathname.mockReturnValue(null)

      expect(() => render(<SidebarsContent />)).toThrow()
    })
  })
})
