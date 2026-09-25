import { render, screen } from '@testing-library/react'

// --- Mocks ---

jest.mock('../content', () => ({
  useNavItems: jest.fn(() => [
    {
      title: 'US_SIDEBAR.account.title.string',
      isActive: true,
      collapsedIcon: () => null,
      items: [
        {
          title: 'US_SIDEBAR.account.profile.string',
          url: '/user_settings/profile',
          icon: () => null,
        },
      ],
    },
  ]),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

const mockUsePathname = jest.fn(() => '/user_settings/profile')

jest.mock('@/lib/i18n/navigation', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  usePathname: () => mockUsePathname(),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: any) => <div>{children}</div>,
  SidebarMenu: ({ children }: any) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: any) => <li>{children}</li>,
  SidebarMenuButton: ({ children, isActive }: any) => (
    <button data-active={isActive ? 'true' : 'false'}>{children}</button>
  ),
  SidebarMenuSub: ({ children }: any) => <ul>{children}</ul>,
  SidebarMenuSubItem: ({ children }: any) => <li>{children}</li>,
}))

jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: any) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: any) => <div>{children}</div>,
  CollapsibleContent: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('../collapsed-sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="collapsed-nav" />,
}))

// --- Tests ---

import Sidebar from '../sidebar-content'

describe('Sidebar (user-settings)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<Sidebar />)
  })

  it('should render nav items from useNavItems', () => {
    render(<Sidebar />)
    expect(
      screen.getAllByText('US_SIDEBAR.account.title.string').length
    ).toBeGreaterThan(0)
  })

  it('should render the collapsed nav menu', () => {
    render(<Sidebar />)
    expect(screen.getByTestId('collapsed-nav')).toBeInTheDocument()
  })

  it('marks the current settings page as active', () => {
    mockUsePathname.mockReturnValue('/user_settings/profile')
    render(<Sidebar />)
    expect(
      screen.getByRole('button', {
        name: 'US_SIDEBAR.account.profile.string',
      })
    ).toHaveAttribute('data-active', 'true')
  })

  it('does not mark other settings pages as active', () => {
    mockUsePathname.mockReturnValue('/user_settings/mail/filters')
    render(<Sidebar />)
    expect(
      screen.getByRole('button', {
        name: 'US_SIDEBAR.account.profile.string',
      })
    ).toHaveAttribute('data-active', 'false')
  })
})
