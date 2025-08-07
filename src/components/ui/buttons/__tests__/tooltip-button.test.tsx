import { TooltipButton } from '@/components/ui/buttons/tooltip-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

// Mock the Radix UI tooltip components to make testing more predictable
jest.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
  Root: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-root">{children}</div>
  ),
  Trigger: ({ children, asChild, ...props }: any) => (
    <div data-testid="tooltip-trigger" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-portal">{children}</div>
  ),
  Content: ({ children, side, sideOffset, className, ...props }: any) => (
    <div
      data-testid="tooltip-content"
      data-side={side}
      data-side-offset={sideOffset}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}))

// Wrapper component to provide tooltip context
const TooltipWrapper = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider>{children}</TooltipProvider>
)

describe('TooltipButton', () => {
  const defaultProps = {
    children: 'Test Button',
  }

  describe('Basic Rendering', () => {
    it('renders button without tooltip when tooltip prop is not provided', () => {
      render(<TooltipButton {...defaultProps} />)

      const button = screen.getByRole('button', { name: /test button/i })
      expect(button).toBeInTheDocument()
      expect(screen.queryByTestId('tooltip-root')).not.toBeInTheDocument()
    })

    it('renders button with tooltip when tooltip prop is provided', () => {
      render(
        <TooltipWrapper>
          <TooltipButton {...defaultProps} tooltip="Test tooltip" />
        </TooltipWrapper>
      )

      const button = screen.getByRole('button', { name: /test button/i })
      expect(button).toBeInTheDocument()
      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument()
      expect(screen.getByText('Test tooltip')).toBeInTheDocument()
    })

    it('matches snapshot without tooltip', () => {
      const { asFragment } = render(<TooltipButton {...defaultProps} />)
      expect(asFragment()).toMatchSnapshot()
    })

    it('matches snapshot with tooltip', () => {
      const { asFragment } = render(
        <TooltipWrapper>
          <TooltipButton {...defaultProps} tooltip="Test tooltip" />
        </TooltipWrapper>
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('Tooltip Content', () => {
    it('displays string tooltip content', () => {
      render(
        <TooltipWrapper>
          <TooltipButton {...defaultProps} tooltip="String tooltip" />
        </TooltipWrapper>
      )

      expect(screen.getByText('String tooltip')).toBeInTheDocument()
    })

    it('displays React node tooltip content', () => {
      const tooltipContent = (
        <div>
          <strong>Rich</strong> tooltip content
        </div>
      )

      render(
        <TooltipWrapper>
          <TooltipButton {...defaultProps} tooltip={tooltipContent} />
        </TooltipWrapper>
      )

      expect(screen.getByText('Rich')).toBeInTheDocument()
      expect(screen.getByText('tooltip content')).toBeInTheDocument()
    })

    it('handles empty string tooltip', () => {
      render(
        <TooltipWrapper>
          <TooltipButton {...defaultProps} tooltip="" />
        </TooltipWrapper>
      )

      // Empty string should not render tooltip structure (falsy value)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.queryByTestId('tooltip-root')).not.toBeInTheDocument()
    })

    it('handles null tooltip', () => {
      render(
        <TooltipWrapper>
          <TooltipButton {...defaultProps} tooltip={null} />
        </TooltipWrapper>
      )

      // Null should not render tooltip structure (falsy value)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.queryByTestId('tooltip-root')).not.toBeInTheDocument()
    })
  })

  describe('Tooltip Positioning', () => {
    it('sets default tooltip side to bottom', () => {
      render(
        <TooltipWrapper>
          <TooltipButton {...defaultProps} tooltip="Test tooltip" />
        </TooltipWrapper>
      )

      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent).toHaveAttribute('data-side', 'bottom')
    })

    it('sets tooltip side to top when specified', () => {
      render(
        <TooltipWrapper>
          <TooltipButton
            {...defaultProps}
            tooltip="Test tooltip"
            tooltipSide="top"
          />
        </TooltipWrapper>
      )

      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent).toHaveAttribute('data-side', 'top')
    })

    it('sets tooltip side to left when specified', () => {
      render(
        <TooltipWrapper>
          <TooltipButton
            {...defaultProps}
            tooltip="Test tooltip"
            tooltipSide="left"
          />
        </TooltipWrapper>
      )

      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent).toHaveAttribute('data-side', 'left')
    })

    it('sets tooltip side to right when specified', () => {
      render(
        <TooltipWrapper>
          <TooltipButton
            {...defaultProps}
            tooltip="Test tooltip"
            tooltipSide="right"
          />
        </TooltipWrapper>
      )

      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent).toHaveAttribute('data-side', 'right')
    })
  })

  describe('Button Props and Variants', () => {
    it('passes through button props correctly', () => {
      render(
        <TooltipButton
          {...defaultProps}
          variant="destructive"
          size="lg"
          disabled
          className="custom-class"
          onClick={jest.fn()}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toBeDisabled()
    })

    it('works with different button variants', () => {
      const variants = [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ] as const

      variants.forEach((variant) => {
        const { unmount } = render(
          <TooltipButton variant={variant} tooltip={`${variant} tooltip`}>
            {variant} button
          </TooltipButton>
        )

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(screen.getByText(`${variant} tooltip`)).toBeInTheDocument()

        unmount()
      })
    })

    it('works with different button sizes', () => {
      const sizes = ['default', 'sm', 'lg', 'icon'] as const

      sizes.forEach((size) => {
        const { unmount } = render(
          <TooltipButton size={size} tooltip={`${size} tooltip`}>
            {size} button
          </TooltipButton>
        )

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()

        unmount()
      })
    })
  })

  describe('Event Handling', () => {
    it('handles click events', () => {
      const handleClick = jest.fn()

      render(<TooltipButton {...defaultProps} onClick={handleClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles click events with tooltip', () => {
      const handleClick = jest.fn()

      render(
        <TooltipWrapper>
          <TooltipButton
            {...defaultProps}
            tooltip="Test tooltip"
            onClick={handleClick}
          />
        </TooltipWrapper>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not trigger click when disabled', () => {
      const handleClick = jest.fn()

      render(<TooltipButton {...defaultProps} disabled onClick={handleClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles keyboard events', () => {
      const handleClick = jest.fn()

      render(<TooltipButton {...defaultProps} onClick={handleClick} />)

      const button = screen.getByRole('button')
      button.focus()
      // Simulate pressing Enter key which should trigger click
      fireEvent.keyPress(button, { key: 'Enter', code: 'Enter', charCode: 13 })

      // Note: React Testing Library's fireEvent doesn't automatically convert
      // keyPress to click for buttons, so we'll test that the button is focusable
      // and can receive keyboard events
      expect(button).toHaveFocus()
    })
  })

  describe('Ref Forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = jest.fn()

      render(<TooltipButton {...defaultProps} ref={ref} />)

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
    })

    it('forwards ref to button element with tooltip', () => {
      const ref = jest.fn()

      render(
        <TooltipWrapper>
          <TooltipButton {...defaultProps} tooltip="Test" ref={ref} />
        </TooltipWrapper>
      )

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
    })
  })

  describe('Accessibility', () => {
    it('maintains button accessibility attributes', () => {
      render(
        <TooltipButton
          {...defaultProps}
          aria-label="Custom label"
          aria-describedby="description"
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom label')
      expect(button).toHaveAttribute('aria-describedby', 'description')
    })

    it('is keyboard navigable', () => {
      render(
        <div>
          <TooltipButton>First button</TooltipButton>
          <TooltipButton tooltip="Second tooltip">Second button</TooltipButton>
        </div>
      )

      const firstButton = screen.getByRole('button', { name: /first button/i })
      const secondButton = screen.getByRole('button', {
        name: /second button/i,
      })

      // Focus first button
      firstButton.focus()
      expect(firstButton).toHaveFocus()

      // Tab to second button
      fireEvent.keyDown(firstButton, { key: 'Tab', code: 'Tab' })
      secondButton.focus()
      expect(secondButton).toHaveFocus()
    })

    it('supports screen readers with proper button semantics', () => {
      render(
        <TooltipWrapper>
          <TooltipButton tooltip="Help text">Save Document</TooltipButton>
        </TooltipWrapper>
      )

      const button = screen.getByRole('button', { name: /save document/i })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })
  })

  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(TooltipButton.displayName).toBe('TooltipButton')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined tooltip prop gracefully', () => {
      render(<TooltipButton {...defaultProps} tooltip={undefined} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.queryByTestId('tooltip-root')).not.toBeInTheDocument()
    })

    it('handles false tooltip prop gracefully', () => {
      render(<TooltipButton {...defaultProps} tooltip={false as any} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.queryByTestId('tooltip-root')).not.toBeInTheDocument()
    })

    it('handles 0 as tooltip content', () => {
      render(
        <TooltipWrapper>
          <TooltipButton {...defaultProps} tooltip={0 as any} />
        </TooltipWrapper>
      )

      // 0 is falsy in JavaScript, so tooltip won't render
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.queryByTestId('tooltip-root')).not.toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <TooltipWrapper>
          <TooltipButton tooltip="Empty button" />
        </TooltipWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Empty button')).toBeInTheDocument()
    })

    it('works without TooltipProvider when no tooltip', () => {
      // This should not crash even without TooltipProvider
      render(<TooltipButton {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Multiple Instances', () => {
    it('renders multiple tooltip buttons correctly', () => {
      render(
        <TooltipWrapper>
          <TooltipButton tooltip="First tooltip">First</TooltipButton>
          <TooltipButton tooltip="Second tooltip">Second</TooltipButton>
          <TooltipButton>Third (no tooltip)</TooltipButton>
        </TooltipWrapper>
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.getByText('Third (no tooltip)')).toBeInTheDocument()
      expect(screen.getByText('First tooltip')).toBeInTheDocument()
      expect(screen.getByText('Second tooltip')).toBeInTheDocument()
    })
  })
})
