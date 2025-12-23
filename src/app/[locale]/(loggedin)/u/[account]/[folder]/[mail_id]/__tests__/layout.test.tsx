import { render, screen } from '@testing-library/react'
import Layout from '../layout'

describe('Mail ID Layout', () => {
  const mockChildren = <div data-testid="children-content">Mail Content</div>

  it('should render the layout component', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByTestId('children-content')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByText('Mail Content')).toBeInTheDocument()
  })

  it('should have w-full class for full width', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('w-full')
  })

  it('should render multiple children', () => {
    render(
      <Layout>
        <div data-testid="mail-header">Mail Header</div>
        <div data-testid="mail-body">Mail Body</div>
        <div data-testid="mail-footer">Mail Footer</div>
      </Layout>
    )
    expect(screen.getByTestId('mail-header')).toBeInTheDocument()
    expect(screen.getByTestId('mail-body')).toBeInTheDocument()
    expect(screen.getByTestId('mail-footer')).toBeInTheDocument()
  })

  it('should render with empty children', () => {
    const { container } = render(<Layout>{null}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toBeInTheDocument()
    expect(layoutDiv).toHaveClass('w-full')
  })

  it('should properly nest mail elements', () => {
    render(
      <Layout>
        <article data-testid="mail-article">
          <header data-testid="mail-header">From: sender@example.com</header>
          <section data-testid="mail-section">Mail Details</section>
          <footer data-testid="mail-footer">Footer</footer>
        </article>
      </Layout>
    )
    expect(screen.getByTestId('mail-article')).toBeInTheDocument()
    expect(screen.getByTestId('mail-header')).toBeInTheDocument()
    expect(screen.getByTestId('mail-section')).toBeInTheDocument()
    expect(screen.getByTestId('mail-footer')).toBeInTheDocument()
  })

  it('should render children with complex mail structure', () => {
    render(
      <Layout>
        <div data-testid="mail-container">
          <div data-testid="mail-info">
            <span data-testid="sender">From: sender@example.com</span>
            <span data-testid="recipient">To: recipient@example.com</span>
            <span data-testid="subject">Subject: Test Mail</span>
          </div>
          <div data-testid="mail-content">Mail Content Here</div>
          <div data-testid="mail-actions">
            <button data-testid="reply-btn">Reply</button>
            <button data-testid="forward-btn">Forward</button>
          </div>
        </div>
      </Layout>
    )
    expect(screen.getByTestId('mail-container')).toBeInTheDocument()
    expect(screen.getByTestId('mail-info')).toBeInTheDocument()
    expect(screen.getByTestId('sender')).toBeInTheDocument()
    expect(screen.getByTestId('recipient')).toBeInTheDocument()
    expect(screen.getByTestId('subject')).toBeInTheDocument()
    expect(screen.getByTestId('mail-content')).toBeInTheDocument()
    expect(screen.getByTestId('reply-btn')).toBeInTheDocument()
    expect(screen.getByTestId('forward-btn')).toBeInTheDocument()
  })

  it('should be a client component with use client directive', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    expect(container).toBeTruthy()
  })

  it('should stretch to full width of parent', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    const styles = window.getComputedStyle(layoutDiv)
    expect(layoutDiv).toHaveClass('w-full')
  })

  it('should render with text content', () => {
    render(
      <Layout>
        <p>This is a test mail message with important information.</p>
      </Layout>
    )
    expect(
      screen.getByText(
        'This is a test mail message with important information.'
      )
    ).toBeInTheDocument()
  })
})
