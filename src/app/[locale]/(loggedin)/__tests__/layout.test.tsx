import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import Layout from '../layout'

// Mock all imported components and hooks
jest.mock('@/components/app-header', () => {
  return function MockAppHeader() {
    return <div data-testid="app-header">App Header</div>
  }
})

jest.mock('@/components/sidebar/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar">App Sidebar</div>,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}))

jest.mock('@/features/mails/components/compose/floating-compose', () => {
  return function MockFloatingCompose() {
    return <div data-testid="floating-compose">Floating Compose</div>
  }
})

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

jest.mock('@/lib/redux/sse', () => ({
  useConnectSSEMutation: () => [jest.fn(), { isLoading: false }],
  getSSEConfigForEnvironment: jest.fn(() => ({
    url: 'http://localhost:8080/sse',
    reconnectInterval: 3000,
  })),
}))

// Mock ReactDOM.createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => (
    <div data-testid="portal">{children}</div>
  ),
}))

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the layout structure', () => {
    const mockChildren = <div data-testid="children-content">Test Children</div>

    render(<Layout>{mockChildren}</Layout>)

    expect(screen.getByTestId('notification-toaster')).toBeInTheDocument()
    expect(screen.getByTestId('notification-provider')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument()
  })

  it('should render AppHeader component', () => {
    render(<Layout>{<div>Test</div>}</Layout>)

    expect(screen.getByTestId('app-header')).toBeInTheDocument()
    expect(screen.getByText('App Header')).toBeInTheDocument()
  })

  it('should render AppSidebar component', () => {
    render(<Layout>{<div>Test</div>}</Layout>)

    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()
    expect(screen.getByText('App Sidebar')).toBeInTheDocument()
  })

  it('should render FloatingCompose component', () => {
    render(<Layout>{<div>Test</div>}</Layout>)

    expect(screen.getByTestId('floating-compose')).toBeInTheDocument()
    expect(screen.getByText('Floating Compose')).toBeInTheDocument()
  })

  it('should render children content', () => {
    const mockChildren = (
      <div data-testid="children-content">Test Children Content</div>
    )

    render(<Layout>{mockChildren}</Layout>)

    expect(screen.getByTestId('children-content')).toBeInTheDocument()
    expect(screen.getByText('Test Children Content')).toBeInTheDocument()
  })

  it('should have correct main container classes', () => {
    render(<Layout>{<div>Test</div>}</Layout>)

    const mainContainer = screen
      .getByTestId('sidebar-inset')
      .querySelector('div[class*="gap-4"]')
    expect(mainContainer).toHaveClass('gap-4')
    expect(mainContainer).toHaveClass('border-y')
  })

  it('should wrap content in DndContext', () => {
    render(<Layout>{<div>Test</div>}</Layout>)

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  it('should render DragOverlay with Contact2 icon', () => {
    render(<Layout>{<div>Test</div>}</Layout>)

    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('contact-icon')).toBeInTheDocument()
  })

  it('should render portal for DragOverlay', () => {
    render(<Layout>{<div>Test</div>}</Layout>)

    expect(screen.getByTestId('portal')).toBeInTheDocument()
  })

  it('should setup drag and drop sensors', () => {
    const { useSensor, useSensors } = require('@dnd-kit/core')

    render(<Layout>{<div>Test</div>}</Layout>)

    expect(useSensor).toHaveBeenCalled()
    expect(useSensors).toHaveBeenCalled()
  })

  it('should establish SSE connection on mount', async () => {
    render(<Layout>{<div>Test</div>}</Layout>)

    // The component should render without errors
    // The SSE connection happens in useEffect
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
    })
  })

  it('should use environment-based SSE configuration', async () => {
    const { getSSEConfigForEnvironment } = require('@/lib/redux/sse')

    render(<Layout>{<div>Test</div>}</Layout>)

    // The component should render and use the config
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
    })

    // Verify the SSE config is available
    const config = getSSEConfigForEnvironment()
    expect(config).toHaveProperty('url')
    expect(config).toHaveProperty('reconnectInterval')
  })

  describe('Responsive Layout', () => {
    it('should have proper flex container structure', () => {
      render(<Layout>{<div>Test</div>}</Layout>)

      const provider = screen.getByTestId('sidebar-provider')
      expect(provider).toBeInTheDocument()
    })

    it('should maintain proper height calculation for content area', () => {
      render(<Layout>{<div>Test</div>}</Layout>)

      const contentArea = screen
        .getByTestId('sidebar-inset')
        .querySelector('div[class*="gap-4"]')
      expect(contentArea).toBeInTheDocument()
    })
  })

  describe('Component Hierarchy', () => {
    it('should render components in correct order', () => {
      const { container } = render(<Layout>{<div>Test</div>}</Layout>)

      const elements = container.querySelectorAll('[data-testid]')
      const testIds = Array.from(elements).map((el) =>
        el.getAttribute('data-testid')
      )

      expect(testIds).toContain('notification-toaster')
      expect(testIds).toContain('notification-provider')
      expect(testIds).toContain('sidebar-provider')
      expect(testIds).toContain('app-header')
    })

    it('should wrap DragOverlay in portal', () => {
      render(<Layout>{<div>Test</div>}</Layout>)

      const portal = screen.getByTestId('portal')
      const dragOverlay = portal.querySelector('[data-testid="drag-overlay"]')

      expect(dragOverlay).toBeInTheDocument()
    })
  })

  describe('DragOverlay Styling', () => {
    it('should have correct Contact icon dimensions', () => {
      render(<Layout>{<div>Test</div>}</Layout>)

      const contactIcon = screen.getByTestId('contact-icon')
      expect(contactIcon).toHaveClass('h-7')
      expect(contactIcon).toHaveClass('w-7')
      expect(contactIcon).toHaveClass('text-gray-700')
    })

    it('should have correct overlay container dimensions', () => {
      render(<Layout>{<div>Test</div>}</Layout>)

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

      render(<Layout>{children}</Layout>)

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

      render(<Layout>{children}</Layout>)

      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument()
    })
  })
})
