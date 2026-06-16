import { render, screen } from '@testing-library/react'

// --- Mocks (must run before SidebarItem — pulls in dialogs using i18n navigation) ---

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ account: '0', folder: 'INBOX' })),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
}))

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

import SidebarItem from '../sidebar-item'
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

  describe('Rename menu item', () => {
    const folderProps = {
      folderPath: 'INBOX/Work',
      folderName: 'Work',
      accountId: '0',
      isDefault: false,
    }

    it('should show rename for user-created folders', () => {
      mockProfile()
      render(<SidebarItem {...defaultProps} {...folderProps} />)
      expect(
        screen.getByText('folders.actions.rename.string')
      ).toBeInTheDocument()
    })

    it('should not show rename for default system folders', () => {
      mockProfile()
      render(
        <SidebarItem
          {...defaultProps}
          {...folderProps}
          isDefault
          folderType="INBOX"
          folderPath="INBOX"
          folderName="INBOX"
        />
      )
      expect(
        screen.queryByText('folders.actions.rename.string')
      ).not.toBeInTheDocument()
    })
  })
})
