import { render, screen } from '@testing-library/react'
import Layout from '../layout'

describe('Layout', () => {
  it('renders children', () => {
    render(
      <Layout>
        <div data-testid="child">test content</div>
      </Layout>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('test content')).toBeInTheDocument()
  })

  it('applies correct CSS classes to the container', () => {
    const { container } = render(
      <Layout>
        <div />
      </Layout>
    )
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('h-[calc(100vh-var(--header-height))]')
    expect(layoutDiv).toHaveClass('overflow-y-auto')
    expect(layoutDiv).toHaveClass('p-2')
  })
})
