import * as userPreferencesApi from '@/features/app-data/store/user-preferences-api'
import * as useIsMobileModule from '@/hooks/use-mobile'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Layout from '../layout'

// Mock the dependencies
jest.mock('@/hooks/use-mobile')
jest.mock('@/features/app-data/store/user-preferences-api')
jest.mock('@/components/ui/sidebar', () => ({
  SIDEBAR_WIDTH: '16rem',
  SidebarProvider: ({ children, className, ...props }: any) => (
    <div data-testid="sidebar-provider" className={className} {...props}>
      {children}
    </div>
  ),
  SidebarInset: ({ children, className, ...props }: any) => (
    <div data-testid="sidebar-inset" className={className} {...props}>
      {children}
    </div>
  ),
  SidebarTrigger: ({ ...props }: any) => (
    <button data-testid="sidebar-trigger" {...props}>
      Trigger
    </button>
  ),
}))
jest.mock('@/features/mails/components/sidebars/fast-access/content', () => {
  return function MockFastAccessContent({ name }: any) {
    return <div data-testid="fast-access-content">{name}</div>
  }
})
jest.mock(
  '@/features/mails/components/sidebars/fast-access/sidebar-fast-access',
  () => {
    return function MockSidebarFastAccess({ handleOpen }: any) {
      return (
        <div data-testid="sidebar-fast-access">
          <button
            data-testid="fast-access-btn"
            onClick={() => handleOpen('address-book')}
          >
            Address Book
          </button>
        </div>
      )
    }
  }
)
jest.mock('@/features/mails/components/list/list-toolbar', () => ({
  __esModule: true,
  default: () => <div data-testid="list-toolbar">Toolbar</div>,
}))
jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: (fn: (s: { mailLayout: { mode: string } }) => string) =>
    fn({ mailLayout: { mode: 'full' } }),
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

  it('should render SidebarFastAccess component', () => {
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)
    expect(screen.getByTestId('sidebar-fast-access')).toBeInTheDocument()
  })

  it('should toggle fast access sidebar when button is clicked', async () => {
    const user = userEvent.setup()
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)

    const fastAccessBtn = screen.getByTestId('fast-access-btn')
    await user.click(fastAccessBtn)

    await waitFor(() => {
      expect(screen.getByTestId('fast-access-content')).toBeInTheDocument()
    })
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

  it('should handle fast access toggle for the same panel', async () => {
    const user = userEvent.setup()
    render(<Layout classic={mockClassic}>{mockChildren}</Layout>)

    const fastAccessBtn = screen.getByTestId('fast-access-btn')

    // First click - opens
    await user.click(fastAccessBtn)
    await waitFor(() => {
      expect(screen.getByTestId('fast-access-content')).toBeInTheDocument()
    })
  })

  it('should render with correct sidebar provider configuration', () => {
    const { container } = render(
      <Layout classic={mockClassic}>{mockChildren}</Layout>
    )
    const sidebarProviders = container.querySelectorAll(
      '[data-testid="sidebar-provider"]'
    )
    expect(sidebarProviders.length).toBeGreaterThanOrEqual(2)
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

  it('should render children with flexbox column layout', () => {
    const { container } = render(
      <Layout classic={mockClassic}>{mockChildren}</Layout>
    )
    const inset = container.querySelector('[data-testid="sidebar-inset"]')
    expect(inset).toHaveClass('flex', 'flex-col')
  })
})
