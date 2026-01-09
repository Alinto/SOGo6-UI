import { render, screen } from '@testing-library/react'
import Layout from '../layout'

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({
    book_id: 'test-book-id',
  })),
}))

// Mock i18n navigation hooks
const mockPush = jest.fn()
const mockUsePathname = jest.fn(() => '/en/address_books/test-book-id')
jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

describe('AddressBook Layout', () => {
  const mockChildren = (
    <div data-testid="children-content">Children Content</div>
  )
  const mockVisualization = (
    <div data-testid="visualization-content">Visualization Content</div>
  )

  beforeEach(() => {
    const { usePathname } = require('@/lib/i18n/navigation')
    ;(usePathname as jest.Mock).mockReturnValue(
      '/en/address_books/test-book-id'
    )
  })

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

  it('should have min-h-full on the main container', () => {
    const { container } = render(
      <Layout visualization={mockVisualization}>{mockChildren}</Layout>
    )
    const mainContainer = container.querySelector('.min-h-full')
    expect(mainContainer).toBeInTheDocument()
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

  it('should not render mobile panel when no contact is selected', () => {
    const { container } = render(
      <Layout visualization={mockVisualization}>{mockChildren}</Layout>
    )
    
    // When no contact is selected, the mobile panel should not be visible
    const fixedPanel = container.querySelector('.fixed.inset-0')
    expect(fixedPanel).not.toBeInTheDocument()
  })
})
