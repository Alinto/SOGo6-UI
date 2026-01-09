import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Layout from '../layout'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: any) => (
    <img alt={alt} src={src} {...props} data-testid="sogo-image" />
  ),
}))

describe('Auth Login Layout', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    const { container } = render(
      <Layout>
        <div>Child Component</div>
      </Layout>
    )

    expect(container).toBeTruthy()
  })

  it('renders SOGo logo image', () => {
    render(
      <Layout>
        <div>Test</div>
      </Layout>
    )

    const image = screen.getByTestId('sogo-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', 'SOGo')
    expect(image).toHaveAttribute('src', '/images/sogo-full.svg')
  })

  it('renders multiple children', () => {
    render(
      <Layout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Layout>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('has correct grid layout classes', () => {
    const { container } = render(
      <Layout>
        <div>Test</div>
      </Layout>
    )

    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('min-h-svh', 'lg:grid-cols-2')
  })
})
