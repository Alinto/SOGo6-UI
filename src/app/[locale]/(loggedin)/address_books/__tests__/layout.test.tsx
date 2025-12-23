import { render, screen } from '@testing-library/react'
import Layout from '../layout'

describe('AddressBooks Layout', () => {
  const mockChildren = (
    <div data-testid="children-content">Address Books Content</div>
  )

  it('should render the layout component', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByTestId('children-content')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByText('Address Books Content')).toBeInTheDocument()
  })

  it('should have flex container with full height', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()
    expect(flexContainer).toHaveClass('h-full', 'flex-col')
  })

  it('should render multiple children', () => {
    render(
      <Layout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Layout>
    )
    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('should apply flex-col layout class', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const flexContainer = container.querySelector('.flex-col')
    expect(flexContainer).toBeInTheDocument()
  })

  it('should maintain full height with flex layout', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const flexContainer = container.firstChild as HTMLElement
    expect(flexContainer).toHaveClass('flex', 'h-full', 'flex-col')
  })

  it('should render with empty children', () => {
    const { container } = render(<Layout>{null}</Layout>)
    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()
  })

  it('should properly nest children elements', () => {
    const { container } = render(
      <Layout>
        <section data-testid="section">
          <article data-testid="article">Article Content</article>
        </section>
      </Layout>
    )
    expect(screen.getByTestId('section')).toBeInTheDocument()
    expect(screen.getByTestId('article')).toBeInTheDocument()
    expect(screen.getByText('Article Content')).toBeInTheDocument()
  })
})
