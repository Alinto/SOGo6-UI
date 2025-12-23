import { render, screen } from '@testing-library/react'
import Layout from '../layout'

describe('User Settings Layout', () => {
  const mockChildren = (
    <div data-testid="children-content">User Settings Content</div>
  )

  it('should render the layout component', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByTestId('children-content')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByText('User Settings Content')).toBeInTheDocument()
  })

  it('should have correct height using CSS variable', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('h-[calc(100vh-var(--header-height))]')
  })

  it('should have overflow-y-auto for vertical scrolling', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('overflow-y-auto')
  })

  it('should have padding class', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('p-2')
  })

  it('should render multiple children', () => {
    render(
      <Layout>
        <div data-testid="setting-1">Setting 1</div>
        <div data-testid="setting-2">Setting 2</div>
        <div data-testid="setting-3">Setting 3</div>
      </Layout>
    )
    expect(screen.getByTestId('setting-1')).toBeInTheDocument()
    expect(screen.getByTestId('setting-2')).toBeInTheDocument()
    expect(screen.getByTestId('setting-3')).toBeInTheDocument()
  })

  it('should apply all styling classes correctly', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass(
      'h-[calc(100vh-var(--header-height))]',
      'overflow-y-auto',
      'p-2'
    )
  })

  it('should render with empty children', () => {
    const { container } = render(<Layout>{null}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toBeInTheDocument()
  })

  it('should properly nest settings elements', () => {
    render(
      <Layout>
        <section data-testid="settings-section">
          <header data-testid="settings-header">Settings Header</header>
          <form data-testid="settings-form">
            <div data-testid="form-group">Setting Group</div>
          </form>
        </section>
      </Layout>
    )
    expect(screen.getByTestId('settings-section')).toBeInTheDocument()
    expect(screen.getByTestId('settings-header')).toBeInTheDocument()
    expect(screen.getByTestId('settings-form')).toBeInTheDocument()
    expect(screen.getByTestId('form-group')).toBeInTheDocument()
  })

  it('should render children with complex content', () => {
    render(
      <Layout>
        <div data-testid="settings-container">
          <h1 data-testid="page-title">User Settings</h1>
          <nav data-testid="settings-nav">
            <ul data-testid="settings-list">
              <li data-testid="profile-link">Profile</li>
              <li data-testid="password-link">Password</li>
              <li data-testid="notifications-link">Notifications</li>
            </ul>
          </nav>
          <main data-testid="settings-main">
            <section data-testid="setting-section-1">Setting 1</section>
            <section data-testid="setting-section-2">Setting 2</section>
          </main>
        </div>
      </Layout>
    )
    expect(screen.getByTestId('settings-container')).toBeInTheDocument()
    expect(screen.getByTestId('page-title')).toBeInTheDocument()
    expect(screen.getByTestId('settings-nav')).toBeInTheDocument()
    expect(screen.getByTestId('settings-list')).toBeInTheDocument()
    expect(screen.getByTestId('profile-link')).toBeInTheDocument()
    expect(screen.getByTestId('password-link')).toBeInTheDocument()
    expect(screen.getByTestId('notifications-link')).toBeInTheDocument()
    expect(screen.getByTestId('settings-main')).toBeInTheDocument()
    expect(screen.getByTestId('setting-section-1')).toBeInTheDocument()
    expect(screen.getByTestId('setting-section-2')).toBeInTheDocument()
  })

  it('should allow vertical scrolling with overflow-y-auto', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    const styles = window.getComputedStyle(layoutDiv)
    // Check that overflow-y-auto is applied
    expect(layoutDiv.className).toContain('overflow-y-auto')
  })

  it('should use header height CSS variable for height calculation', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    const className = layoutDiv.className
    expect(className).toContain('h-[calc(100vh-var(--header-height))]')
  })

  it('should render text content within settings', () => {
    render(
      <Layout>
        <p>This is a user settings page with important information.</p>
      </Layout>
    )
    expect(
      screen.getByText(
        'This is a user settings page with important information.'
      )
    ).toBeInTheDocument()
  })

  it('should render form elements within settings', () => {
    render(
      <Layout>
        <form>
          <label htmlFor="email-input">Email</label>
          <input data-testid="email-input" type="email" />
          <button data-testid="save-btn">Save</button>
        </form>
      </Layout>
    )
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('save-btn')).toBeInTheDocument()
  })
})
