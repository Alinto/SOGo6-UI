import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import FeatureIncoming from '../feature-incoming'

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroupContent: ({
    children,
    className,
  }: {
    children: ReactNode
    className?: string
  }) => (
    <div data-testid="sidebar-group-content" className={className}>
      {children}
    </div>
  ),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      title: 'Feature incoming',
      description: 'Under development.',
    }
    return map[key] ?? key
  },
}))

jest.mock('lucide-react', () => ({
  Construction: ({ className }: { className?: string }) => (
    <span data-testid="construction-icon" className={className} />
  ),
}))

describe('FeatureIncoming', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders title and description', () => {
      render(<FeatureIncoming />)
      expect(screen.getByText('Feature incoming')).toBeInTheDocument()
      expect(screen.getByText('Under development.')).toBeInTheDocument()
    })

    it('renders construction icon', () => {
      render(<FeatureIncoming />)
      expect(screen.getByTestId('construction-icon')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('applies layout classes on group content', () => {
      render(<FeatureIncoming />)
      const root = screen.getByTestId('sidebar-group-content')
      expect(root).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })
  })

  describe('accessibility', () => {
    it('uses paragraph elements for copy', () => {
      render(<FeatureIncoming />)
      const paragraphs = screen.getAllByRole('paragraph')
      expect(paragraphs.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('children rendering', () => {
    it('wraps text and icon inside group content', () => {
      render(<FeatureIncoming />)
      const root = screen.getByTestId('sidebar-group-content')
      expect(root).toContainElement(screen.getByTestId('construction-icon'))
      expect(root).toHaveTextContent('Feature incoming')
    })
  })
})
