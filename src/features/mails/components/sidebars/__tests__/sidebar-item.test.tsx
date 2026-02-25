import { render, screen } from '@testing-library/react'
import SidebarItem from '../sidebar-item'

// --- Mocks ---

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenuAction: ({ children }: any) => <div>{children}</div>,
  SidebarMenuButton: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}))

jest.mock('lucide-react/dynamic', () => ({
  DynamicIcon: ({ name }: any) => <span data-testid={`icon-${name}`} />,
}))

// --- Imports after mocks ---

import { useProfile } from '@/features/user-profile'

// --- Helper ---

const mockProfile = (overrides = {}) => {
  ;(useProfile as jest.Mock).mockReturnValue({
    mailPurgeAllow: false,
    ...overrides,
  })
}

const defaultProps = {
  name: 'INBOX',
  id: 'inbox',
  handleClick: jest.fn(),
}

// --- Tests ---

describe('SidebarItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      mockProfile()
      render(<SidebarItem {...defaultProps} />)
    })

    it('should display the item name', () => {
      mockProfile()
      render(<SidebarItem {...defaultProps} />)
      expect(screen.getByText('INBOX')).toBeInTheDocument()
    })
  })

  describe('Purge menu item', () => {
    it('should NOT show purge item when mailPurgeAllow is false', () => {
      mockProfile({ mailPurgeAllow: false })
      render(<SidebarItem {...defaultProps} />)
      expect(
        screen.queryByText('folders.actions.purge.string')
      ).not.toBeInTheDocument()
    })

    it('should show purge item when mailPurgeAllow is true', () => {
      mockProfile({ mailPurgeAllow: true })
      render(<SidebarItem {...defaultProps} />)
      expect(
        screen.getByText('folders.actions.purge.string')
      ).toBeInTheDocument()
    })
  })

  describe('Actions disabled', () => {
    it('should not render dropdown when disableActions is true', () => {
      mockProfile()
      render(<SidebarItem {...defaultProps} disableActions />)
      expect(
        screen.queryByText('folders.actions.rename.string')
      ).not.toBeInTheDocument()
    })
  })
})
