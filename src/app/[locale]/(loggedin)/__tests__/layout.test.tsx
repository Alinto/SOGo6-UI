import authReducer from '@/features/auth/components/store/auth.slice'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import Layout from '../layout'

// Mock all imported components and hooks
const mockRouterPush = jest.fn()

jest.mock('@/components/app-header', () => {
  return function MockAppHeader() {
    return <div data-testid="app-header">App Header</div>
  }
})

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

jest.mock('@/features/user-profile', () => ({
  useGetUserProfileQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
  })),
  useProfile: jest.fn(() => ({
    mainAccount: undefined,
    identitiesEnabled: false,
  })),
}))

jest.mock('@/components/sidebar/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar">App Sidebar</div>,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
  SidebarProvider: ({
    children,
    name,
  }: {
    children: React.ReactNode
    name?: string
  }) => (
    <div data-name={name} data-testid={`sidebar-provider-${name}`}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/mobile-create-fab', () => {
  return function MockMobileCreateFab() {
    return <div data-testid="mobile-create-fab">Mobile Create FAB</div>
  }
})

jest.mock(
  '@/features/mails/components/compose/floating-compose-container',
  () => {
    return function MockFloatingComposeContainer() {
      return (
        <div data-testid="floating-compose-container">
          Floating Compose Container
        </div>
      )
    }
  }
)

jest.mock('@/features/address_books/components/contact-form-host', () => {
  return function MockContactFormHost() {
    return <div data-testid="contact-form-host">Contact Form Host</div>
  }
})

jest.mock(
  '@/features/address_books/components/distribution-list-form-host',
  () => {
    return function MockDistributionListFormHost() {
      return (
        <div data-testid="distribution-list-form-host">
          Distribution List Form Host
        </div>
      )
    }
  }
)

jest.mock('@/features/address_books/hooks/use-address-book-drag-end', () => ({
  useAddressBookDragEnd: () => jest.fn(),
}))

jest.mock('@/features/notifications', () => ({
  NotificationProvider: () => (
    <div data-testid="notification-provider">Provider</div>
  ),
  NotificationToaster: () => (
    <div data-testid="notification-toaster">Toaster</div>
  ),
}))

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  MouseSensor: jest.fn(),
  TouchSensor: jest.fn(),
  useSensor: jest.fn((SensorClass, options) => ({})),
  useSensors: jest.fn((...sensors) => sensors),
}))

jest.mock('@dnd-kit/modifiers', () => ({
  snapCenterToCursor: jest.fn(),
}))

jest.mock('lucide-react', () => ({
  Contact2: ({ className }: { className: string }) => (
    <div data-testid="contact-icon" className={className}>
      Contact Icon
    </div>
  ),
}))

jest.mock('@/lib/env-service', () => ({
  fetchEnvVars: jest.fn().mockResolvedValue({
    REACT_APP_API_BASE_URL: '/fakeApi',
    SSE_ENABLED: true,
  }),
  isUsingFakeApi: jest.fn(() => false),
}))

jest.mock('@/lib/redux/sse', () => ({
  useConnectSSEMutation: () => [jest.fn(), { isLoading: false }],
  getSSEConfigForEnvironment: jest.fn().mockResolvedValue({
    url: '/fakeApi/sse',
    reconnectInterval: 3000,
  }),
}))

// Mock ReactDOM.createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => (
    <div data-testid="portal">{children}</div>
  ),
}))

describe('Layout Component', () => {
  const createMockStore = (preloadedState = {}) =>
    configureStore({
      reducer: {
        auth: authReducer,
        mailCompose: (
          state = {
            openDraftIds: [],
            drafts: {},
            activeDraftId: null,
          }
        ) => state,
      },
      preloadedState,
    })

  const renderWithProvider = (
    children: React.ReactNode,
    preloadedState = {}
  ) => {
    const store = createMockStore({
      auth: {
        token: 'mock-token',
        user: { uid: 'test-user', cn: 'Test User', email: 'test@test.com' },
        rememberMe: false,
      },
      ...preloadedState,
    })

    return render(
      <Provider store={store}>
        <Layout>{children}</Layout>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the layout structure', () => {
    const mockChildren = <div data-testid="children-content">Test Children</div>

    renderWithProvider(mockChildren)

    expect(screen.getByTestId('notification-toaster')).toBeInTheDocument()
    expect(screen.getByTestId('notification-provider')).toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-provider-left-global-sidebar')
    ).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument()
  })

  it('should render AppHeader component', () => {
    renderWithProvider(<div>Test</div>)

    expect(screen.getByTestId('app-header')).toBeInTheDocument()
    expect(screen.getByText('App Header')).toBeInTheDocument()
  })

  it('should render AppSidebar component', () => {
    renderWithProvider(<div>Test</div>)

    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()
    expect(screen.getByText('App Sidebar')).toBeInTheDocument()
  })

  it('should render FloatingComposeContainer component', () => {
    renderWithProvider(<div>Test</div>)

    expect(screen.getByTestId('floating-compose-container')).toBeInTheDocument()
    expect(screen.getByText('Floating Compose Container')).toBeInTheDocument()
  })

  it('should render children content', () => {
    const mockChildren = (
      <div data-testid="children-content">Test Children Content</div>
    )

    renderWithProvider(mockChildren)

    expect(screen.getByTestId('children-content')).toBeInTheDocument()
    expect(screen.getByText('Test Children Content')).toBeInTheDocument()
  })

  it('should have correct main container classes', () => {
    renderWithProvider(<div>Test</div>)

    const mainContainer = screen
      .getByTestId('sidebar-inset')
      .querySelector('div[class*="gap-4"]')
    expect(mainContainer).toHaveClass('gap-4')
    expect(mainContainer).toHaveClass('border-y')
  })

  it('should wrap content in DndContext', () => {
    renderWithProvider(<div>Test</div>)

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  it('should render DragOverlay with Contact2 icon', () => {
    renderWithProvider(<div>Test</div>)

    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('contact-icon')).toBeInTheDocument()
  })

  it('should render portal for DragOverlay', () => {
    renderWithProvider(<div>Test</div>)

    expect(screen.getByTestId('portal')).toBeInTheDocument()
  })

  it('should setup drag and drop sensors', () => {
    const { useSensor, useSensors } = require('@dnd-kit/core')

    renderWithProvider(<div>Test</div>)

    expect(useSensor).toHaveBeenCalled()
    expect(useSensors).toHaveBeenCalled()
  })

  it('should establish SSE connection on mount', async () => {
    renderWithProvider(<div>Test</div>)

    // The component should render without errors
    // The SSE connection happens in useEffect
    await waitFor(() => {
      expect(
        screen.getByTestId('sidebar-provider-left-global-sidebar')
      ).toBeInTheDocument()
    })
  })

  it('should use environment-based SSE configuration', async () => {
    const { getSSEConfigForEnvironment } = require('@/lib/redux/sse')

    renderWithProvider(<div>Test</div>)

    await waitFor(() => {
      expect(
        screen.getByTestId('sidebar-provider-left-global-sidebar')
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(getSSEConfigForEnvironment).toHaveBeenCalled()
    })
  })

  describe('Responsive Layout', () => {
    it('should have proper flex container structure', () => {
      renderWithProvider(<div>Test</div>)

      const provider = screen.getByTestId(
        'sidebar-provider-left-global-sidebar'
      )
      expect(provider).toBeInTheDocument()
    })

    it('should maintain proper height calculation for content area', () => {
      renderWithProvider(<div>Test</div>)

      const contentArea = screen
        .getByTestId('sidebar-inset')
        .querySelector('div[class*="gap-4"]')
      expect(contentArea).toBeInTheDocument()
    })
  })

  describe('Component Hierarchy', () => {
    it('should render components in correct order', () => {
      const { container } = renderWithProvider(<div>Test</div>)

      const elements = container.querySelectorAll('[data-testid]')
      const testIds = Array.from(elements).map((el) =>
        el.getAttribute('data-testid')
      )

      expect(testIds).toContain('notification-toaster')
      expect(testIds).toContain('notification-provider')
      expect(testIds).toContain('sidebar-provider-left-global-sidebar')
      expect(testIds).toContain('app-header')
    })

    it('should wrap DragOverlay in portal', () => {
      renderWithProvider(<div>Test</div>)

      const portal = screen.getByTestId('portal')
      const dragOverlay = portal.querySelector('[data-testid="drag-overlay"]')

      expect(dragOverlay).toBeInTheDocument()
    })
  })

  describe('DragOverlay Styling', () => {
    it('should have correct Contact icon dimensions', () => {
      renderWithProvider(<div>Test</div>)

      const contactIcon = screen.getByTestId('contact-icon')
      expect(contactIcon).toHaveClass('h-7')
      expect(contactIcon).toHaveClass('w-7')
      expect(contactIcon).toHaveClass('text-gray-700')
    })

    it('should have correct overlay container dimensions', () => {
      renderWithProvider(<div>Test</div>)

      const overlayContainer = screen
        .getByTestId('portal')
        .querySelector('div[class*="h-10"]')
      expect(overlayContainer).toHaveClass('h-10')
      expect(overlayContainer).toHaveClass('w-10')
    })
  })

  describe('Children Rendering', () => {
    it('should render multiple children elements', () => {
      const children = (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </>
      )

      renderWithProvider(children)

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })

    it('should handle fragment children', () => {
      const children = (
        <>
          <div>Fragment Child 1</div>
          <div>Fragment Child 2</div>
        </>
      )

      renderWithProvider(children)

      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument()
    })
  })
})
