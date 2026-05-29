import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-group" className={className}>
      {children}
    </div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-label">{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import TasksSidebarSkeleton from '../skeleton'

describe('TasksSidebarSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders smart views and calendars section labels', () => {
      render(<TasksSidebarSkeleton />)
      expect(screen.getByText('sidebar.smart_views.title.string')).toBeInTheDocument()
      expect(screen.getByText('sidebar.calendars.title.string')).toBeInTheDocument()
    })
  })

  describe('children rendering', () => {
    it('renders multiple skeleton placeholders', () => {
      render(<TasksSidebarSkeleton />)
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThanOrEqual(8)
    })
  })
})
