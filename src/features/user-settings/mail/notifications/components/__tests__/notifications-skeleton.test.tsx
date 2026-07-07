import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import NotificationsSettingsSkeleton from '../notifications-skeleton'

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
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-title">{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

jest.mock('@/components/ui/skeletons/inputs', () => ({
  __esModule: true,
  default: () => <div data-testid="input-skeleton" />,
}))

jest.mock('@/components/ui/skeletons/buttons', () => ({
  FixedButtonGroupSkeleton: () => <div data-testid="button-group-skeleton" />,
}))

describe('NotificationsSettingsSkeleton', () => {
  it('renders card structure with header and content', () => {
    render(<NotificationsSettingsSkeleton />)

    expect(screen.getByTestId('card')).toHaveClass('w-full')
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toHaveClass('border-t', 'pt-4')
  })

  it('renders skeleton placeholders for title and fields', () => {
    render(<NotificationsSettingsSkeleton />)

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThanOrEqual(4)
    expect(screen.getAllByTestId('input-skeleton')).toHaveLength(2)
  })

  it('renders fixed button group skeleton', () => {
    render(<NotificationsSettingsSkeleton />)

    expect(screen.getByTestId('button-group-skeleton')).toBeInTheDocument()
  })
})
