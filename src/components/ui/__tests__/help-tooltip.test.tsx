import { render, screen, fireEvent } from '@testing-library/react'
import { HelpTooltip } from '@/components/ui/help-tooltip'

// Mock the Tooltip primitives to simplify testing
jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
  }) => <div data-testid="tooltip" data-open={open}>{children}</div>,
  TooltipTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}))

describe('HelpTooltip', () => {
  const defaultMessage = 'This is a help message'

  it('renders the HelpCircle icon', () => {
    render(<HelpTooltip message={defaultMessage} />)
    // lucide-react renders an <svg>; confirm it's present
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders the tooltip content with the provided message', () => {
    render(<HelpTooltip message={defaultMessage} />)
    expect(screen.getByText(defaultMessage)).toBeInTheDocument()
  })

  it('starts with the tooltip closed', () => {
    render(<HelpTooltip message={defaultMessage} />)
    expect(screen.getByTestId('tooltip')).toHaveAttribute('data-open', 'false')
  })

  it('opens the tooltip when the icon is clicked', () => {
    render(<HelpTooltip message={defaultMessage} />)
    const icon = document.querySelector('svg')!
    fireEvent.click(icon)
    expect(screen.getByTestId('tooltip')).toHaveAttribute('data-open', 'true')
  })

  it('toggles the tooltip closed on a second click', () => {
    render(<HelpTooltip message={defaultMessage} />)
    const icon = document.querySelector('svg')!
    fireEvent.click(icon)
    fireEvent.click(icon)
    expect(screen.getByTestId('tooltip')).toHaveAttribute('data-open', 'false')
  })

  it('applies the default class to the icon', () => {
    render(<HelpTooltip message={defaultMessage} />)
    const icon = document.querySelector('svg')!
    expect(icon).toHaveClass('text-muted-foreground')
    expect(icon).toHaveClass('h-4')
    expect(icon).toHaveClass('w-4')
  })

  it('merges a custom className onto the icon', () => {
    render(<HelpTooltip message={defaultMessage} className="text-red-500" />)
    const icon = document.querySelector('svg')!
    expect(icon).toHaveClass('text-red-500')
    // Default classes should still be present
    expect(icon).toHaveClass('h-4')
    expect(icon).toHaveClass('w-4')
  })

  it('renders the message inside a <p> with correct classes', () => {
    render(<HelpTooltip message={defaultMessage} />)
    const p = screen.getByText(defaultMessage)
    expect(p.tagName).toBe('P')
    expect(p).toHaveClass('max-w-xs')
    expect(p).toHaveClass('text-sm')
  })
})