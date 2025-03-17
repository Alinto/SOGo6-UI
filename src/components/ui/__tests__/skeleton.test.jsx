import { Skeleton } from '@/components/ui/skeleton'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

// filepath: /SOGo/src/components/ui/skeleton.test.tsx

describe('Skeleton component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies default classes', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass(
      'animate-pulse rounded-md bg-primary/10'
    )
  })

  it('applies additional classes', () => {
    const { container } = render(<Skeleton className="extra-class" />)
    expect(container.firstChild).toHaveClass('extra-class')
  })

  it('passes additional props', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'skeleton')
  })
})
