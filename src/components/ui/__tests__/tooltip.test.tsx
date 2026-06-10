import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// filepath: /SOGo/src/components/ui/tooltip.test.tsx

describe('Tooltip component', () => {
  it('renders TooltipProvider without crashing', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('renders TooltipTrigger without crashing', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('renders TooltipContent without crashing', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    await user.hover(trigger)

    await waitFor(() => {
      // Use getAllByText and select the visible one (not the screen reader span)
      const tooltipElements = screen.getAllByText('Tooltip content')
      const visibleTooltip = tooltipElements.find(
        (el) => !el.getAttribute('style')?.includes('position: absolute')
      )
      expect(visibleTooltip).toBeInTheDocument()
    })
  })

  it('applies default classes to TooltipContent', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    await user.hover(trigger)

    await waitFor(() => {
      // Use getAllByText and select the visible one (not the screen reader span)
      const tooltipElements = screen.getAllByText('Tooltip content')
      const visibleTooltip = tooltipElements.find(
        (el) => !el.getAttribute('style')?.includes('position: absolute')
      )
      expect(visibleTooltip).toHaveClass(
        'z-[9999]',
        'overflow-hidden',
        'rounded-md',
        'bg-primary',
        'px-3',
        'py-1.5',
        'text-xs',
        'text-primary-foreground'
      )
    })
  })

  it('applies additional classes to TooltipContent', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="extra-class">
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    await user.hover(trigger)

    await waitFor(() => {
      // Use getAllByText and select the visible one (not the screen reader span)
      const tooltipElements = screen.getAllByText('Tooltip content')
      const visibleTooltip = tooltipElements.find(
        (el) => !el.getAttribute('style')?.includes('position: absolute')
      )
      expect(visibleTooltip).toHaveClass('extra-class')
    })
  })

  it('passes additional props to TooltipContent', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    await user.hover(trigger)

    await waitFor(() => {
      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent).toBeInTheDocument()
    })
  })
})
