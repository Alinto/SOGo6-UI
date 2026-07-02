import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import FiltersSettingsSkeleton from '../filters-skeleton'

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

describe('FiltersSettingsSkeleton', () => {
  it('renders card structure with header and content', () => {
    render(<FiltersSettingsSkeleton />)
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('renders skeleton placeholders for header and filter rows', () => {
    render(<FiltersSettingsSkeleton />)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(5)
  })

  it('renders three filter row placeholders', () => {
    render(<FiltersSettingsSkeleton />)
    const rows = screen
      .getByTestId('card-content')
      .querySelectorAll('.rounded-lg.border')
    expect(rows).toHaveLength(3)
  })
})
