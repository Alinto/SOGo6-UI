import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Toggle } from '../toggle'

// Mock the dependencies with inline implementations
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

// Mock the @radix-ui/react-toggle module
jest.mock('@radix-ui/react-toggle', () => ({
  Root: React.forwardRef<HTMLButtonElement, any>(
    ({ pressed, onPressedChange, children, ...props }, ref) => (
      <button
        ref={ref}
        data-testid={props['data-testid'] || 'toggle-root'}
        data-state={pressed ? 'on' : 'off'}
        aria-pressed={pressed}
        onClick={onPressedChange}
        {...props}
      >
        {children}
      </button>
    )
  ),
}))

describe('Toggle', () => {
  describe('Basic Rendering', () => {
    it('renders basic toggle button', () => {
      render(<Toggle>Toggle Button</Toggle>)

      expect(screen.getByTestId('toggle-root')).toBeInTheDocument()
      expect(screen.getByText('Toggle Button')).toBeInTheDocument()
    })

    it('renders without children', () => {
      render(<Toggle />)
      expect(screen.getByTestId('toggle-root')).toBeInTheDocument()
    })
  })

  describe('Styling and Variants', () => {
    it('applies custom className', () => {
      render(<Toggle className="custom-toggle-class">Toggle</Toggle>)

      const toggle = screen.getByTestId('toggle-root')
      expect(toggle).toHaveClass('custom-toggle-class')
    })

    it('uses cn utility for combining classes', () => {
      const mockCn = require('@/lib/utils').cn as jest.Mock
      mockCn.mockReturnValue('combined-classes')

      render(
        <Toggle className="custom-class" variant="outline" size="lg">
          Toggle
        </Toggle>
      )

      const toggle = screen.getByTestId('toggle-root')
      expect(toggle).toHaveClass('combined-classes')
      expect(mockCn).toHaveBeenCalled()
    })
  })

  describe('State Management', () => {
    it('handles pressed state', () => {
      render(<Toggle pressed={true}>Pressed Toggle</Toggle>)

      const toggle = screen.getByTestId('toggle-root')
      expect(toggle).toHaveAttribute('aria-pressed', 'true')
    })

    it('handles unpressed state', () => {
      render(<Toggle pressed={false}>Unpressed Toggle</Toggle>)

      const toggle = screen.getByTestId('toggle-root')
      expect(toggle).toHaveAttribute('aria-pressed', 'false')
    })

    it('handles click events', () => {
      const mockOnPressedChange = jest.fn()
      render(<Toggle onPressedChange={mockOnPressedChange}>Toggle</Toggle>)

      const toggle = screen.getByTestId('toggle-root')
      fireEvent.click(toggle)

      expect(mockOnPressedChange).toHaveBeenCalled()
    })
  })

  describe('Props and Accessibility', () => {
    it('forwards props correctly', () => {
      render(
        <Toggle
          pressed={true}
          disabled={true}
          aria-label="Custom toggle"
          data-testid="custom-toggle"
        >
          Custom Toggle
        </Toggle>
      )

      const toggle = screen.getByTestId('custom-toggle')
      expect(toggle).toBeInTheDocument()
      expect(toggle).toHaveAttribute('aria-pressed', 'true')
      expect(toggle).toBeDisabled()
      expect(toggle).toHaveAttribute('aria-label', 'Custom toggle')
    })

    it('maintains ref forwarding', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Toggle ref={ref}>Toggle</Toggle>)

      expect(ref.current).not.toBeNull()
      expect(ref.current).toBe(screen.getByTestId('toggle-root'))
    })
  })
})
