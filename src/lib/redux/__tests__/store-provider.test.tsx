import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

// Mock react-redux Provider
const MockProvider = jest.fn(({ children }) => (
  <div data-testid="provider">{children}</div>
))
jest.mock('react-redux', () => ({
  Provider: MockProvider,
}))

// Mock store
const mockStore = {
  dispatch: jest.fn(),
  getState: jest.fn(),
  subscribe: jest.fn(),
}

const mockMakeStore = jest.fn(() => mockStore)
jest.mock('../store', () => ({
  makeStore: mockMakeStore,
  AppStore: {},
}))

describe('StoreProvider', () => {
  let StoreProvider: any

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset module cache to get fresh imports
    jest.resetModules()
  })

  beforeAll(async () => {
    // Import the component after mocks are set up
    const module = await import('../store-provider')
    StoreProvider = module.default
  })

  describe('component rendering', () => {
    it('should render children inside Provider', () => {
      render(
        <StoreProvider>
          <div data-testid="child">Test Child</div>
        </StoreProvider>
      )

      expect(screen.getByTestId('provider')).toBeInTheDocument()
      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should pass store to Provider', () => {
      render(
        <StoreProvider>
          <div>Content</div>
        </StoreProvider>
      )

      expect(MockProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          store: mockStore,
          children: expect.anything(),
        }),
        expect.anything()
      )
    })

    it('should render multiple children', () => {
      render(
        <StoreProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </StoreProvider>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })

  describe('store initialization', () => {
    it('should create store using makeStore', () => {
      render(
        <StoreProvider>
          <div>Test</div>
        </StoreProvider>
      )

      expect(mockMakeStore).toHaveBeenCalledTimes(1)
    })

    it('should create store only once per component instance', () => {
      const { rerender } = render(
        <StoreProvider>
          <div>Test 1</div>
        </StoreProvider>
      )

      rerender(
        <StoreProvider>
          <div>Test 2</div>
        </StoreProvider>
      )

      // Should still be called only once due to useRef
      expect(mockMakeStore).toHaveBeenCalledTimes(1)
    })

    it('should create new store for different component instances', () => {
      render(
        <StoreProvider>
          <div>Instance 1</div>
        </StoreProvider>
      )

      render(
        <StoreProvider>
          <div>Instance 2</div>
        </StoreProvider>
      )

      expect(mockMakeStore).toHaveBeenCalledTimes(2)
    })
  })

  describe('store persistence', () => {
    it('should maintain store reference across re-renders', () => {
      const { rerender } = render(
        <StoreProvider>
          <div>Initial</div>
        </StoreProvider>
      )

      const initialCallCount = MockProvider.mock.calls.length
      const initialStore =
        MockProvider.mock.calls[initialCallCount - 1][0].store

      rerender(
        <StoreProvider>
          <div>Updated</div>
        </StoreProvider>
      )

      const updatedCallCount = MockProvider.mock.calls.length
      const updatedStore =
        MockProvider.mock.calls[updatedCallCount - 1][0].store

      expect(initialStore).toBe(updatedStore)
    })

    it('should use useRef to prevent store recreation', () => {
      // This test indirectly verifies useRef usage by checking that
      // makeStore is called only once despite re-renders
      const TestComponent = ({ count }: { count: number }) => (
        <StoreProvider>
          <div>Count: {count}</div>
        </StoreProvider>
      )

      const { rerender } = render(<TestComponent count={1} />)
      rerender(<TestComponent count={2} />)
      rerender(<TestComponent count={3} />)

      expect(mockMakeStore).toHaveBeenCalledTimes(1)
    })
  })

  describe('component interface', () => {
    it('should accept ReactNode children', () => {
      // Test with different types of children
      render(
        <StoreProvider>
          <div>Div child</div>
          <span>Span child</span>
          {'String child'}
          {42}
          {null}
        </StoreProvider>
      )

      expect(screen.getByTestId('provider')).toBeInTheDocument()
    })

    it('should handle empty children', () => {
      render(<StoreProvider>{null}</StoreProvider>)
      expect(screen.getByTestId('provider')).toBeInTheDocument()
    })

    it('should handle undefined children', () => {
      render(<StoreProvider>{undefined}</StoreProvider>)
      expect(screen.getByTestId('provider')).toBeInTheDocument()
    })
  })

  describe('provider props', () => {
    it('should pass correct props to Provider', () => {
      render(
        <StoreProvider>
          <div>Test</div>
        </StoreProvider>
      )

      const providerCall = MockProvider.mock.calls[0][0]
      expect(providerCall).toHaveProperty('store')
      expect(providerCall).toHaveProperty('children')
      expect(providerCall.store).toBe(mockStore)
    })

    it('should not pass any additional props to Provider', () => {
      render(
        <StoreProvider>
          <div>Test</div>
        </StoreProvider>
      )

      const providerCall = MockProvider.mock.calls[0][0]
      const expectedKeys = ['store', 'children']
      const actualKeys = Object.keys(providerCall)

      expect(actualKeys.sort()).toEqual(expectedKeys.sort())
    })
  })

  describe('error handling', () => {
    it('should call makeStore during initialization', () => {
      // Test that the component attempts to create a store
      render(
        <StoreProvider>
          <div>Test</div>
        </StoreProvider>
      )

      expect(mockMakeStore).toHaveBeenCalledTimes(1)
    })

    it('should create store reference only once per component', () => {
      // Test that store creation is properly managed with useRef
      const { rerender } = render(
        <StoreProvider>
          <div>Initial</div>
        </StoreProvider>
      )

      rerender(
        <StoreProvider>
          <div>Updated</div>
        </StoreProvider>
      )

      // makeStore should still only be called once
      expect(mockMakeStore).toHaveBeenCalledTimes(1)
    })
  })

  describe('performance', () => {
    it('should not recreate store on prop changes', () => {
      const TestWrapper = ({ className }: { className?: string }) => (
        <div className={className}>
          <StoreProvider>
            <div>Content</div>
          </StoreProvider>
        </div>
      )

      const { rerender } = render(<TestWrapper />)
      rerender(<TestWrapper className="new-class" />)

      expect(mockMakeStore).toHaveBeenCalledTimes(1)
    })

    it('should minimize Provider re-renders with stable store reference', () => {
      const { rerender } = render(
        <StoreProvider>
          <div>Test</div>
        </StoreProvider>
      )

      const initialCallCount = MockProvider.mock.calls.length

      rerender(
        <StoreProvider>
          <div>Updated Test</div>
        </StoreProvider>
      )

      // Provider should be called again but with the same store reference
      expect(MockProvider.mock.calls.length).toBeGreaterThan(initialCallCount)

      const firstStore = MockProvider.mock.calls[0][0].store
      const lastStore =
        MockProvider.mock.calls[MockProvider.mock.calls.length - 1][0].store
      expect(firstStore).toBe(lastStore)
    })
  })
})
