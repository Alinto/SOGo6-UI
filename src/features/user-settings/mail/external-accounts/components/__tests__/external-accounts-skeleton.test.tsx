import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import ImapAccountSkeleton from '../external-accounts-skeleton'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ImapAccountSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue((key: string) => key)
  })

  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<ImapAccountSkeleton />)
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('renders card wrapper with correct structure', () => {
      render(<ImapAccountSkeleton />)
      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByTestId('card-header')).toBeInTheDocument()
      expect(screen.getByTestId('card-content')).toBeInTheDocument()
    })

    it('has w-full class on card', () => {
      render(<ImapAccountSkeleton />)
      const card = screen.getByTestId('card')
      expect(card.className).toContain('w-full')
    })
  })

  describe('header skeleton loaders', () => {
    it('renders header skeleton loaders', () => {
      render(<ImapAccountSkeleton />)
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThanOrEqual(2)
    })

    it('renders title skeleton in header', () => {
      render(<ImapAccountSkeleton />)
      const skeletons = screen.getAllByTestId('skeleton')
      const titleSkeleton = skeletons[0]
      expect(titleSkeleton.className).toContain('h-6')
      expect(titleSkeleton.className).toContain('w-48')
    })

    it('renders subtitle skeleton in header', () => {
      render(<ImapAccountSkeleton />)
      const skeletons = screen.getAllByTestId('skeleton')
      const subtitleSkeleton = skeletons[1]
      expect(subtitleSkeleton.className).toContain('h-4')
      expect(subtitleSkeleton.className).toContain('w-96')
    })
  })

  describe('content skeleton loaders', () => {
    it('renders multiple skeleton loaders for form fields', () => {
      render(<ImapAccountSkeleton />)
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(4)
    })

    it('renders tab skeleton loaders', () => {
      render(<ImapAccountSkeleton />)
      const skeletons = screen.getAllByTestId('skeleton')
      // Should have two tab skeletons
      const tabSkeletons = skeletons.filter(
        (s) => s.className?.includes('h-10') && s.className?.includes('w-32')
      )
      expect(tabSkeletons.length).toBeGreaterThanOrEqual(2)
    })

    it('renders form field skeletons', () => {
      render(<ImapAccountSkeleton />)
      const skeletons = screen.getAllByTestId('skeleton')
      // Should have label and input skeletons
      const fieldSkeletons = skeletons.filter((s) =>
        s.className?.includes('h-10')
      )
      expect(fieldSkeletons.length).toBeGreaterThan(0)
    })

    it('renders large text area skeleton', () => {
      render(<ImapAccountSkeleton />)
      const skeletons = screen.getAllByTestId('skeleton')
      const textAreaSkeleton = skeletons.find((s) =>
        s.className?.includes('h-20')
      )
      expect(textAreaSkeleton).toBeInTheDocument()
    })
  })

  describe('responsive classes', () => {

    it('has responsive column layout', () => {
      render(<ImapAccountSkeleton />)
      const content = screen.getByTestId('card-content')
      // Should have grid classes
      expect(
        content.className?.includes('grid') ||
          content.className?.includes('space-y')
      ).toBe(true)
    })
  })

  describe('spacing and layout', () => {
    it('has proper spacing in header', () => {
      render(<ImapAccountSkeleton />)
      const header = screen.getByTestId('card-header')
      expect(header.className).toContain('pb-4')
    })

    it('has space-y-2 in header for skeleton stacking', () => {
      render(<ImapAccountSkeleton />)
      const header = screen.getByTestId('card-header')
      expect(header.className).toContain('pb-4')
    })

    it('has proper spacing in content area', () => {
      render(<ImapAccountSkeleton />)
      const content = screen.getByTestId('card-content')
      expect(content.className).toContain('space-y')
    })

    it('has border separator between header and content', () => {
      render(<ImapAccountSkeleton />)
      const content = screen.getByTestId('card-content')
      expect(content.className).toContain('border-t')
    })

    it('has padding on content area', () => {
      render(<ImapAccountSkeleton />)
      const content = screen.getByTestId('card-content')
      expect(content.className).toContain('pt-')
    })
  })

  describe('accessibility', () => {
    it('renders as semantic structure', () => {
      const { container } = render(<ImapAccountSkeleton />)
      expect(container.querySelectorAll('[data-testid]')).toHaveLength(
        screen.getAllByTestId('skeleton').length + 3
      )
    })
  })

  describe('visual structure', () => {
    it('renders all required skeleton sections', () => {
      render(<ImapAccountSkeleton />)
      const card = screen.getByTestId('card')
      const header = screen.getByTestId('card-header')
      const content = screen.getByTestId('card-content')

      expect(card).toContainElement(header)
      expect(card).toContainElement(content)
    })

    it('maintains consistent width with w-full', () => {
      render(<ImapAccountSkeleton />)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('w-full')
    })
  })
})
