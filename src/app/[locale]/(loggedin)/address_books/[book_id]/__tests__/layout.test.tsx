import { render, screen } from '@testing-library/react'
import Layout from '../layout'

describe('AddressBook Layout', () => {
  const mockChildren = (
    <div data-testid="children-content">Children Content</div>
  )
  const mockVisualization = (
    <div data-testid="visualization-content">Visualization Content</div>
  )

  it('should render the layout component', () => {
    render(<Layout visualization={mockVisualization}>{mockChildren}</Layout>)
    expect(screen.getByTestId('children-content')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(<Layout visualization={mockVisualization}>{mockChildren}</Layout>)
    expect(screen.getByText('Children Content')).toBeInTheDocument()
  })

  it('should render visualization content', () => {
    render(<Layout visualization={mockVisualization}>{mockChildren}</Layout>)
    expect(screen.getByTestId('visualization-content')).toBeInTheDocument()
  })

  it('should have correct structure with flex container', () => {
    const { container } = render(
      <Layout visualization={mockVisualization}>{mockChildren}</Layout>
    )
    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()
  })

  it('should apply header height variable to both panels', () => {
    const { container } = render(
      <Layout visualization={mockVisualization}>{mockChildren}</Layout>
    )
    const panels = container.querySelectorAll(
      '[class*="h-[calc(100vh-var(--header-height))]"]'
    )
    expect(panels.length).toBeGreaterThan(0)
  })

  it('should have border between panels', () => {
    const { container } = render(
      <Layout visualization={mockVisualization}>{mockChildren}</Layout>
    )
    const childrenPanel = container.querySelector('.border-r')
    expect(childrenPanel).toBeInTheDocument()
  })

  it('should have responsive width classes on children panel', () => {
    const { container } = render(
      <Layout visualization={mockVisualization}>{mockChildren}</Layout>
    )
    const childrenPanel = container.querySelector('.w-full')
    expect(childrenPanel).toBeInTheDocument()
    expect(childrenPanel).toHaveClass('md:w-1/2', 'lg:w-2/5')
  })

  it('should hide visualization on small screens', () => {
    const { container } = render(
      <Layout visualization={mockVisualization}>{mockChildren}</Layout>
    )
    const visualizationPanel = container.querySelector('.hidden')
    expect(visualizationPanel).toBeInTheDocument()
    expect(visualizationPanel).toHaveClass('md:flex')
  })

  it('should have responsive width classes on visualization panel', () => {
    const { container } = render(
      <Layout visualization={mockVisualization}>{mockChildren}</Layout>
    )
    const visualizationPanel = container.querySelector('.hidden')
    expect(visualizationPanel).toHaveClass('md:w-1/2', 'lg:w-3/5')
  })

  it('should apply overflow-y-auto to both panels', () => {
    const { container } = render(
      <Layout visualization={mockVisualization}>{mockChildren}</Layout>
    )
    const panels = container.querySelectorAll('.overflow-y-auto')
    expect(panels.length).toBeGreaterThanOrEqual(2)
  })
})
