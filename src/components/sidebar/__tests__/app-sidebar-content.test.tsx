import { render, screen } from '@testing-library/react'
import SidebarsContent from '../app-sidebar-content'

// Mock navigation
const mockUsePathname = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

// Mock useProfile
jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(() => ({
    moduleAccess: [],
    isLoading: false,
  })),
}))

// Mock sidebars
jest.mock('@/features/address_books/components/sidebar/sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="address-books-sidebar" />,
}))

jest.mock('@/features/mails/components/sidebars/sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-sidebar" />,
}))

jest.mock('@/features/user-settings/sidebar/sidebar-content', () => ({
  __esModule: true,
  default: () => <div data-testid="user-settings-sidebar" />,
}))

jest.mock('@/features/calendars/components/sidebar/sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="calendars-sidebar" />,
}))

jest.mock('@/features/admin-panel/components/sidebar/sidebar-content', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-panel-sidebar" />,
}))

describe('SidebarsContent', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('route selection', () => {
    it.each([
      ['/address_books/123', 'address-books-sidebar'],
      ['/user_settings/general', 'user-settings-sidebar'],
      ['/calendars/view', 'calendars-sidebar'],
      ['/u/account/inbox', 'mail-sidebar'],
    ])('renders %s sidebar', (path, testId) => {
      mockUsePathname.mockReturnValue(path)
      render(<SidebarsContent />)
      expect(screen.getByTestId(testId)).toBeInTheDocument()
    })

    it('renders null for unknown routes', () => {
      mockUsePathname.mockReturnValue('/unknown')
      const { container } = render(<SidebarsContent />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('module access', () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue('/address_books/123')
    })

    it('renders when loading', () => {
      jest.requireMock('@/features/user-profile').useProfile.mockReturnValue({
        moduleAccess: [],
        isLoading: true,
      })
      render(<SidebarsContent />)
      expect(screen.getByTestId('address-books-sidebar')).toBeInTheDocument()
    })

    it('renders when moduleAccess empty', () => {
      jest.requireMock('@/features/user-profile').useProfile.mockReturnValue({
        moduleAccess: [],
        isLoading: false,
      })
      render(<SidebarsContent />)
      expect(screen.getByTestId('address-books-sidebar')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it.each([
      '',
      '/',
      'address_books/123',
      '/Address_Books/123',
    ])('handles %s → null', (path) => {
      mockUsePathname.mockReturnValue(path)
      const { container } = render(<SidebarsContent />)
      expect(container.firstChild).toBeNull()
    })
  })

  it('renders only one sidebar', () => {
    const paths = ['/address_books/test', '/user_settings/test']
    paths.forEach(path => {
      mockUsePathname.mockReturnValue(path)
      const { unmount } = render(<SidebarsContent />)
      
      const sidebars = [
        'address-books-sidebar',
        'user-settings-sidebar',
        'calendars-sidebar',
        'mail-sidebar',
      ].filter(id => screen.queryByTestId(id))
      
      expect(sidebars).toHaveLength(1)
      unmount()
    })
  })
})
