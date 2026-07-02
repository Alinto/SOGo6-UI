import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

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

import VacationSettingsSkeleton from '../vacation-skeleton'

describe('VacationSettingsSkeleton', () => {
  it('renders card structure with skeleton placeholders', () => {
    render(<VacationSettingsSkeleton />)

    expect(screen.getByTestId('card')).toHaveClass('shadow-none')
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toHaveClass('space-y-4', 'pb-4')
    expect(screen.getAllByTestId('skeleton')).toHaveLength(7)
  })
})
