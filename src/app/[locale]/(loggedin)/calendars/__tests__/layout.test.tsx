import { render, screen } from '@testing-library/react'
import Layout from '../layout'

describe('Calendars Layout', () => {
  const mockChildren = (
    <div data-testid="children-content">Calendars Content</div>
  )

  it('should render the layout component', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByTestId('children-content')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(<Layout>{mockChildren}</Layout>)
    expect(screen.getByText('Calendars Content')).toBeInTheDocument()
  })

  it('should fill the parent pane without a second page scrollbar', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('h-full')
    expect(layoutDiv).toHaveClass('min-h-0')
    expect(layoutDiv).toHaveClass('overflow-hidden')
  })

  it('should have overflow-hidden to avoid double scroll with RBC', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('overflow-hidden')
  })

  it('should have padding class', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('p-2')
  })

  it('should render multiple children', () => {
    render(
      <Layout>
        <div data-testid="calendar-1">Calendar 1</div>
        <div data-testid="calendar-2">Calendar 2</div>
      </Layout>
    )
    expect(screen.getByTestId('calendar-1')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-2')).toBeInTheDocument()
  })

  it('should apply all styling classes', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('h-full', 'min-h-0', 'overflow-hidden', 'p-2')
  })

  it('should render with empty children', () => {
    const { container } = render(<Layout>{null}</Layout>)
    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toBeInTheDocument()
  })

  it('should properly nest calendar elements', () => {
    render(
      <Layout>
        <section data-testid="calendar-section">
          <header data-testid="calendar-header">Calendar Header</header>
          <div data-testid="calendar-grid">Calendar Grid</div>
        </section>
      </Layout>
    )
    expect(screen.getByTestId('calendar-section')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-header')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()
  })

  it('should render children with complex content', () => {
    render(
      <Layout>
        <div data-testid="calendar-container">
          <nav data-testid="calendar-nav">Navigation</nav>
          <main data-testid="calendar-main">
            <div data-testid="event-1">Event 1</div>
            <div data-testid="event-2">Event 2</div>
          </main>
        </div>
      </Layout>
    )
    expect(screen.getByTestId('calendar-container')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-nav')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-main')).toBeInTheDocument()
    expect(screen.getByTestId('event-1')).toBeInTheDocument()
    expect(screen.getByTestId('event-2')).toBeInTheDocument()
  })
})
