import { render, screen } from '@testing-library/react'
import {
  ComponentLoader,
  FormLoader,
  LazyWrapper,
  createLazyImport,
} from '../lazy-components'

describe('Lazy Components', () => {
  describe('ComponentLoader', () => {
    it('should render the component loader', () => {
      render(<ComponentLoader />)

      expect(screen.getByTestId('component-loader')).toBeInTheDocument()
      expect(screen.getByText('Loading component...')).toBeInTheDocument()
    })
  })

  describe('FormLoader', () => {
    it('should render the form loader', () => {
      render(<FormLoader />)

      expect(screen.getByTestId('form-loader')).toBeInTheDocument()
      expect(screen.getByText('Loading form...')).toBeInTheDocument()
    })
  })

  describe('LazyWrapper', () => {
    it('should render children when provided', () => {
      render(
        <LazyWrapper>
          <div data-testid="child-component">Child Content</div>
        </LazyWrapper>
      )

      expect(screen.getByTestId('child-component')).toBeInTheDocument()
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })
  })

  describe('createLazyImport', () => {
    it('should create a lazy component', async () => {
      const TestComponent = () => (
        <div data-testid="test-component">Test Component</div>
      )
      const LazyTest = createLazyImport(() =>
        Promise.resolve({ default: TestComponent })
      )

      render(<LazyTest />)

      // Wait for component to load
      const component = await screen.findByTestId('test-component')
      expect(component).toBeInTheDocument()
    })
  })
})
