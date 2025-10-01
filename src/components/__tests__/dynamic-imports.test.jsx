import '@testing-library/jest-dom'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { createDynamicComponent } from '../dynamic-imports'

// Mock Next.js dynamic
jest.mock('next/dynamic', () => {
  return jest.fn((importFn, options) => {
    const DynamicComponent = React.lazy(importFn)

    return React.forwardRef((props, ref) => {
      return (
        <React.Suspense
          fallback={options.loading ? options.loading() : <div>Loading...</div>}
        >
          <DynamicComponent {...props} ref={ref} />
        </React.Suspense>
      )
    })
  })
})

// Mock component loader
jest.mock('../lazy-components', () => ({
  ComponentLoader: () => (
    <div data-testid="component-loader">Component Loading...</div>
  ),
}))

const TestComponent = React.forwardRef((props, ref) => (
  <div ref={ref} data-testid="test-component">
    {props.message || 'Test Component Loaded'}
  </div>
))

TestComponent.displayName = 'TestComponent'

describe('Dynamic Imports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createDynamicComponent', () => {
    it('should create a dynamic component with default options', async () => {
      const DynamicTest = createDynamicComponent(() =>
        Promise.resolve({ default: TestComponent })
      )

      render(<DynamicTest />)

      // Should show loading state first
      expect(screen.getByTestId('component-loader')).toBeInTheDocument()

      // Should load the actual component
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
      })

      expect(screen.getByText('Test Component Loaded')).toBeInTheDocument()
    })

    it('should create a dynamic component with custom loading component', async () => {
      const CustomLoader = () => (
        <div data-testid="custom-loader">Custom Loading...</div>
      )

      const DynamicTest = createDynamicComponent(
        () => Promise.resolve({ default: TestComponent }),
        {
          loading: CustomLoader,
        }
      )

      render(<DynamicTest />)

      // Should show custom loading state
      expect(screen.getByTestId('custom-loader')).toBeInTheDocument()
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument()

      // Should load the actual component
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
      })
    })

    it('should create a dynamic component with ssr disabled', async () => {
      const DynamicTest = createDynamicComponent(
        () => Promise.resolve({ default: TestComponent }),
        {
          ssr: false,
        }
      )

      render(<DynamicTest message="SSR Disabled" />)

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
      })

      expect(screen.getByText('SSR Disabled')).toBeInTheDocument()
    })

    it('should pass props to the dynamic component', async () => {
      const DynamicTest = createDynamicComponent(() =>
        Promise.resolve({ default: TestComponent })
      )

      render(<DynamicTest message="Custom Message" />)

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
      })

      expect(screen.getByText('Custom Message')).toBeInTheDocument()
    })

    it('should handle component render errors with error boundary', async () => {
      // Create a component that throws during render
      const ErrorComponent = () => {
        throw new Error('Component render failed')
      }

      const DynamicTest = createDynamicComponent(() =>
        Promise.resolve({ default: ErrorComponent })
      )

      // Error boundary to catch render errors
      class TestErrorBoundary extends React.Component {
        constructor(props) {
          super(props)
          this.state = { hasError: false }
        }

        static getDerivedStateFromError() {
          return { hasError: true }
        }

        render() {
          if (this.state.hasError) {
            return <div data-testid="error-fallback">Something went wrong</div>
          }
          return this.props.children
        }
      }

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      render(
        <TestErrorBoundary>
          <DynamicTest />
        </TestErrorBoundary>
      )

      // Should show loading state initially
      expect(screen.getByTestId('component-loader')).toBeInTheDocument()

      // Wait for error to be caught by error boundary
      await waitFor(
        () => {
          expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
        },
        { timeout: 1000 }
      )

      consoleSpy.mockRestore()
    })

    it('should work with valid components that load successfully', async () => {
      // Simple test to ensure the happy path works
      const ValidComponent = ({ message = 'Valid Component' }) => (
        <div data-testid="valid-component">{message}</div>
      )

      const DynamicTest = createDynamicComponent(() =>
        Promise.resolve({ default: ValidComponent })
      )

      render(<DynamicTest message="Successfully Loaded" />)

      // Should show loading first
      expect(screen.getByTestId('component-loader')).toBeInTheDocument()

      // Then show the actual component
      await waitFor(() => {
        expect(screen.getByTestId('valid-component')).toBeInTheDocument()
      })

      expect(screen.getByText('Successfully Loaded')).toBeInTheDocument()
    })

    it('should forward refs correctly', async () => {
      const ref = React.createRef()

      const DynamicTest = createDynamicComponent(() =>
        Promise.resolve({ default: TestComponent })
      )

      render(<DynamicTest ref={ref} />)

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
      })

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('should handle multiple instances independently', async () => {
      const DynamicTest = createDynamicComponent(() =>
        Promise.resolve({ default: TestComponent })
      )

      render(
        <div>
          <DynamicTest message="First Instance" />
          <DynamicTest message="Second Instance" />
        </div>
      )

      await waitFor(() => {
        expect(screen.getAllByTestId('test-component')).toHaveLength(2)
      })

      expect(screen.getByText('First Instance')).toBeInTheDocument()
      expect(screen.getByText('Second Instance')).toBeInTheDocument()
    })
  })

  describe('Dynamic import patterns', () => {
    it('should support conditional rendering pattern', async () => {
      const ConditionalComponent = () => {
        const [show, setShow] = React.useState(false)

        const DynamicTest = createDynamicComponent(() =>
          Promise.resolve({ default: TestComponent })
        )

        return (
          <div>
            <button onClick={() => setShow(true)} data-testid="show-button">
              Show Component
            </button>
            {show && <DynamicTest message="Conditionally Rendered" />}
          </div>
        )
      }

      render(<ConditionalComponent />)

      // Component should not be rendered initially
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument()

      // Click to show component
      const showButton = screen.getByTestId('show-button')
      await act(async () => {
        await userEvent.click(showButton)
      })

      // Component should now be rendered
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
      })

      expect(screen.getByText('Conditionally Rendered')).toBeInTheDocument()
    })

    it('should support lazy loading with user interaction', async () => {
      const InteractiveComponent = () => {
        const [loadComponent, setLoadComponent] = React.useState(false)

        const DynamicTest = loadComponent
          ? createDynamicComponent(() =>
              Promise.resolve({ default: TestComponent })
            )
          : null

        return (
          <div>
            <button
              onClick={() => setLoadComponent(true)}
              data-testid="load-button"
            >
              Load Dynamic Component
            </button>
            {DynamicTest && <DynamicTest message="User Triggered Load" />}
          </div>
        )
      }

      render(<InteractiveComponent />)

      // Click to trigger dynamic loading
      const loadButton = screen.getByTestId('load-button')
      await act(async () => {
        await userEvent.click(loadButton)
      })

      // Should show loading state then component
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
      })

      expect(screen.getByText('User Triggered Load')).toBeInTheDocument()
    })
  })

  describe('Performance characteristics', () => {
    it('should not block rendering while loading', async () => {
      const DynamicTest = createDynamicComponent(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ default: TestComponent }), 100)
          )
      )

      const start = performance.now()
      render(
        <div>
          <div data-testid="static-content">Static Content</div>
          <DynamicTest />
        </div>
      )
      const renderTime = performance.now() - start

      // Rendering should be fast (not blocked by dynamic import)
      expect(renderTime).toBeLessThan(50)

      // Static content should render immediately
      expect(screen.getByTestId('static-content')).toBeInTheDocument()
      expect(screen.getByTestId('component-loader')).toBeInTheDocument()

      // Dynamic content should load after delay
      await waitFor(
        () => {
          expect(screen.getByTestId('test-component')).toBeInTheDocument()
        },
        { timeout: 1000 }
      )
    })
  })
})
