import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { Separator } from '../separator'

// filepath: src/components/ui/separator.test.tsx

describe('Separator Component', () => {
  it('renders with default props', () => {
    const { container } = render(<Separator />)
    const separator = container.firstChild

    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('shrink-0 bg-border h-[1px] w-full')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('matches snapshot', () => {
    const { asFragment } = render(<Separator />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders with vertical orientation', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.firstChild

    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('shrink-0 bg-border h-full w-[1px]')
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
  })

  it('renders with non-decorative prop', () => {
    const { container } = render(<Separator decorative={false} />)
    const separator = container.firstChild

    expect(separator).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Separator className="custom-class" />)
    const separator = container.firstChild

    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('custom-class')
  })

  it('forwards additional props', () => {
    const { container } = render(<Separator data-testid="separator" />)
    const separator = container.firstChild

    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('data-testid', 'separator')
  })
})
