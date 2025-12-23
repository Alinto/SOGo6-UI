import { render, screen } from '@testing-library/react'
import Layout from '../layout'

describe('Admin Panel Layout', () => {
  const mockChildren = (
    <div data-testid="children-content">Admin Panel Content</div>
  )

  it('should render the layout component', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByTestId('children-content')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByText('Admin Panel Content')).toBeInTheDocument()
  })

  it('should have flex container with flex-col layout', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()
    expect(flexContainer).toHaveClass('flex-col')
  })

  it('should render multiple children', () => {
    render(
      <Layout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </Layout>
    )
    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })

  it('should apply flex-col layout class for vertical stacking', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const flexContainer = container.querySelector('.flex-col')
    expect(flexContainer).toBeInTheDocument()
  })

  it('should maintain flex layout structure', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const flexContainer = container.firstChild as HTMLElement
    expect(flexContainer).toHaveClass('flex', 'flex-col')
  })

  it('should render with empty children', () => {
    const { container } = render(<Layout>{null}</Layout>)
    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()
  })

  it('should properly nest children elements', () => {
    render(
      <Layout>
        <section data-testid="admin-section">
          <header data-testid="admin-header">Admin Header</header>
          <main data-testid="admin-main">Admin Main Content</main>
        </section>
      </Layout>
    )
    expect(screen.getByTestId('admin-section')).toBeInTheDocument()
    expect(screen.getByTestId('admin-header')).toBeInTheDocument()
    expect(screen.getByTestId('admin-main')).toBeInTheDocument()
  })

  it('should render children with different content types', () => {
    render(
      <Layout>
        <div data-testid="text-content">Text Content</div>
        <button data-testid="action-button">Action</button>
        <form data-testid="admin-form">
          <input type="text" />
        </form>
      </Layout>
    )
    expect(screen.getByTestId('text-content')).toBeInTheDocument()
    expect(screen.getByTestId('action-button')).toBeInTheDocument()
    expect(screen.getByTestId('admin-form')).toBeInTheDocument()
  })
})
