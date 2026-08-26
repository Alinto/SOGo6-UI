import * as userPreferencesApi from '@/features/app-data/store/user-preferences-api'
import * as useIsMobileModule from '@/hooks/use-mobile'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import Layout from '../layout'

const { useOfflineNav } = jest.requireMock(
  '@/features/offline/offline-nav-context'
) as { useOfflineNav: jest.Mock }

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/components/sidebar/module-rail', () => ({
  __esModule: true,
  default: () => <div data-testid="module-rail">Module Rail</div>,
}))

// Mock the dependencies
jest.mock('@/hooks/use-mobile')
jest.mock('@/features/app-data/store/user-preferences-api')
jest.mock('@/components/ui/sidebar', () => ({
  SIDEBAR_WIDTH: '16rem',
  SidebarProvider: ({
    children,
    className,
    name,
    open: _open,
    defaultOpen: _defaultOpen,
    width: _width,
    ...rest
  }: {
    children: ReactNode
    className?: string
    name?: string
    open?: boolean
    defaultOpen?: boolean
    width?: string
  }) => (
    <div
      data-testid="sidebar-provider"
      data-name={name}
      className={className}
      {...rest}
    >
      {children}
    </div>
  ),
  SidebarInset: ({ children, className, ...props }: any) => (
    <div data-testid="sidebar-inset" className={className} {...props}>
      {children}
    </div>
  ),
  SidebarTrigger: ({
    onClose: _onClose,
    reverseIcon: _reverseIcon,
    ...props
  }: any) => (
    <button type="button" data-testid="sidebar-trigger" {...props}>
      Trigger
    </button>
  ),
}))
jest.mock('@/features/mails/components/sidebars/fast-access/content', () => {
  return function MockFastAccessContent({ name }: any) {
    return <div data-testid="fast-access-content">{name}</div>
  }
})
jest.mock('@/features/mails/components/list/list-toolbar', () => ({
  __esModule: true,
  default: () => <div data-testid="list-toolbar">Toolbar</div>,
}))
jest.mock('@/features/mails/hooks/use-list-toolbar-mode', () => ({
  useListToolbarMode: jest.fn(() => 'list'),
}))
jest.mock('@/features/mails/components/mail-sse-listener', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-sse-listener" />,
}))
jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: (fn: (s: { mailLayout: { mode: string } }) => string) =>
    fn({ mailLayout: { mode: 'full' } }),
}))
jest.mock('@/features/offline/offline-nav-context', () => ({
  useOfflineNav: jest.fn(() => ({
    view: { kind: 'route' },
    folderPathOverride: null,
    openFolder: jest.fn(),
    openOutbox: jest.fn(),
    openMail: jest.fn(),
    navigateApp: jest.fn(),
    closeOverlay: jest.fn(),
    clearUnavailable: jest.fn(),
  })),
}))
jest.mock('../[mail_id]/page', () => ({
  MailDetailPage: () => <div data-testid="offline-mail-detail" />,
}))
jest.mock('@/features/offline/components/outbox-panel', () => ({
  __esModule: true,
  default: () => <div data-testid="outbox-panel" />,
}))
jest.mock('@/features/offline/components/offline-unavailable', () => ({
  __esModule: true,
  default: () => <div data-testid="offline-unavailable" />,
}))

describe('Mail Folder Layout', () => {
  const mockChildren = (
    <div data-testid="modern-content">Modern Layout Content</div>
  )
  const mockClassic = (
    <div data-testid="classic-content">Classic Layout Content</div>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    useOfflineNav.mockReturnValue({
      view: { kind: 'route' },
      folderPathOverride: null,
      openFolder: jest.fn(),
      openOutbox: jest.fn(),
      openMail: jest.fn(),
      navigateApp: jest.fn(),
      closeOverlay: jest.fn(),
      clearUnavailable: jest.fn(),
    })
    ;(useIsMobileModule.useIsMobile as jest.Mock).mockReturnValue(false)
    ;(userPreferencesApi.useGetPreferencesQuery as jest.Mock).mockReturnValue({
      data: { layoutType: 'modern' },
    })
  })

  it('should render the layout component', () => {
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)
    const sidebarProviders = screen.getAllByTestId('sidebar-provider')
    expect(sidebarProviders.length).toBeGreaterThan(0)
  })

  it('should mount the mail SSE listener', () => {
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)
    expect(screen.getByTestId('mail-sse-listener')).toBeInTheDocument()
  })

  it('should render modern layout content by default', () => {
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)
    expect(screen.getByTestId('modern-content')).toBeInTheDocument()
  })

  it('should render classic layout when layoutType is classic', () => {
    ;(userPreferencesApi.useGetPreferencesQuery as jest.Mock).mockReturnValue({
      data: { layoutType: 'classic' },
    })
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)
    expect(screen.getByTestId('classic-content')).toBeInTheDocument()
  })

  it('should have full height and width content container', () => {
    const { container } = render(
      <Layout classic={mockClassic}>{mockChildren}</Layout>
    )
    const contentDiv = container.querySelector('[class*="overflow-hidden"]')
    expect(contentDiv).toBeInTheDocument()
    expect(contentDiv).toHaveClass('w-full', 'overflow-hidden', 'p-1')
  })

  it('should show SidebarTrigger on desktop', () => {
    ;(useIsMobileModule.useIsMobile as jest.Mock).mockReturnValue(false)
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
  })

  it('should hide SidebarTrigger on mobile', () => {
    ;(useIsMobileModule.useIsMobile as jest.Mock).mockReturnValue(true)
    const { container } = render(
      <Layout classic={mockClassic}>{mockChildren}</Layout>
    )
    // The trigger is wrapped in a conditional, so it shouldn't be in the DOM
    const trigger = container.querySelector('[data-testid="sidebar-trigger"]')
    expect(trigger).not.toBeInTheDocument()
  })

  it('should render with correct sidebar provider configuration', () => {
    const { container } = render(
      <Layout classic={mockClassic}>{mockChildren}</Layout>
    )
    const sidebarProviders = container.querySelectorAll(
      '[data-testid="sidebar-provider"]'
    )
    // Nested: right-global-rail + right-mail-sidebar-2
    expect(sidebarProviders.length).toBe(2)
  })

  it('should use header height CSS variable', () => {
    const { container } = render(
      <Layout classic={mockClassic}>{mockChildren}</Layout>
    )
    const contentDiv = container.querySelector('[class*="overflow-hidden"]')
    expect(contentDiv).toBeInTheDocument()
  })

  it('should default to modern layout when no preferences data', () => {
    ;(userPreferencesApi.useGetPreferencesQuery as jest.Mock).mockReturnValue({
      data: undefined,
    })
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)
    expect(screen.getByTestId('modern-content')).toBeInTheDocument()
  })

  it('should use full content height when toolbar is hidden on mail detail', () => {
    const {
      useListToolbarMode,
    } = require('@/features/mails/hooks/use-list-toolbar-mode')
    useListToolbarMode.mockReturnValue('hidden')

    const { container } = render(
      <Layout classic={mockClassic}>{mockChildren}</Layout>
    )
    const contentDiv = container.querySelector('[class*="overflow-hidden"]')
    expect(contentDiv).toHaveClass('h-[calc(100vh-var(--header-height))]')
  })

  it('should reserve toolbar height when list toolbar is visible', () => {
    const {
      useListToolbarMode,
    } = require('@/features/mails/hooks/use-list-toolbar-mode')
    useListToolbarMode.mockReturnValue('list')

    const { container } = render(
      <Layout classic={mockClassic}>{mockChildren}</Layout>
    )
    const contentDiv = container.querySelector('[class*="overflow-hidden"]')
    expect(contentDiv).toHaveClass('h-[calc(100vh-var(--header-height)-52px)]')
  })

  it('should render children with flexbox column layout', () => {
    const { container } = render(
      <Layout classic={mockClassic}>{mockChildren}</Layout>
    )
    const inset = container.querySelector('[data-testid="sidebar-inset"]')
    expect(inset).toHaveClass('flex', 'flex-col')
  })

  it('should replace the folder list with an offline empty state', () => {
    useOfflineNav.mockReturnValue({
      view: {
        kind: 'unavailable',
        target: 'folder',
        path: 'Sent',
        label: 'Sent',
      },
      folderPathOverride: 'Sent',
      openFolder: jest.fn(),
      openOutbox: jest.fn(),
      openMail: jest.fn(),
      navigateApp: jest.fn(),
      closeOverlay: jest.fn(),
      clearUnavailable: jest.fn(),
    })
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)
    expect(screen.getAllByTestId('offline-unavailable')).toHaveLength(1)
    expect(screen.queryByTestId('modern-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('list-toolbar')).not.toBeInTheDocument()
    const contentDiv = document.querySelector('[class*="overflow-hidden"]')
    expect(contentDiv).toHaveClass('h-[calc(100vh-var(--header-height))]')
  })
})
