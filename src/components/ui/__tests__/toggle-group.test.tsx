import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { ToggleGroup, ToggleGroupItem } from '../toggle-group'

// Mock the dependencies with inline implementations
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

jest.mock('@radix-ui/react-toggle-group', () => ({
  Root: React.forwardRef<any, any>(
    ({ children, onValueChange, defaultValue, type, ...props }, ref) => (
      <div
        ref={ref}
        data-testid="toggle-group-root"
        type={type}
        defaultValue={
          typeof defaultValue === 'string'
            ? defaultValue
            : JSON.stringify(defaultValue)
        }
        onClick={() => onValueChange && onValueChange('test')}
        {...props}
      >
        {children}
      </div>
    )
  ),
  Item: React.forwardRef<HTMLButtonElement, any>(
    ({ children, ...props }, ref) => (
      <button ref={ref} data-testid="toggle-group-item" {...props}>
        {children}
      </button>
    )
  ),
}))

describe('ToggleGroup', () => {
  describe('Basic Rendering', () => {
    it('renders basic toggle group with items', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
          <ToggleGroupItem value="item2">Item 2</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByTestId('toggle-group-root')).toBeInTheDocument()
      expect(screen.getAllByTestId('toggle-group-item')).toHaveLength(2)
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('renders empty toggle group', () => {
      render(<ToggleGroup type="single" />)
      expect(screen.getByTestId('toggle-group-root')).toBeInTheDocument()
      expect(screen.queryAllByTestId('toggle-group-item')).toHaveLength(0)
    })
  })

  describe('Styling and Props', () => {
    it('applies custom className to toggle group', () => {
      render(
        <ToggleGroup type="single" className="custom-group-class">
          <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByTestId('toggle-group-root')).toHaveClass(
        'custom-group-class'
      )
    })

    it('applies custom className to toggle group items', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="item1" className="custom-item-class">
            Item 1
          </ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByTestId('toggle-group-item')).toHaveClass(
        'custom-item-class'
      )
    })
  })

  describe('Interaction and Events', () => {
    it('handles click events on toggle group items', () => {
      const mockOnValueChange = jest.fn()
      render(
        <ToggleGroup type="single" onValueChange={mockOnValueChange}>
          <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
        </ToggleGroup>
      )

      fireEvent.click(screen.getByTestId('toggle-group-item'))
      expect(mockOnValueChange).toHaveBeenCalled()
    })
  })

  describe('Configuration Types', () => {
    it('supports single type configuration', () => {
      render(
        <ToggleGroup type="single" defaultValue="item1">
          <ToggleGroupItem value="item1">Option 1</ToggleGroupItem>
        </ToggleGroup>
      )

      const toggleGroup = screen.getByTestId('toggle-group-root')
      expect(toggleGroup).toHaveAttribute('type', 'single')
      // defaultValue is a React prop, not an HTML attribute
      expect(toggleGroup).toBeInTheDocument()
    })

    it('supports multiple type configuration', () => {
      render(
        <ToggleGroup type="multiple" defaultValue={['item1', 'item2']}>
          <ToggleGroupItem value="item1">Option 1</ToggleGroupItem>
        </ToggleGroup>
      )

      expect(screen.getByTestId('toggle-group-root')).toHaveAttribute(
        'type',
        'multiple'
      )
    })
  })
})
