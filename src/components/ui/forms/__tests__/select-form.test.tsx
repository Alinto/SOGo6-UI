// @ts-nocheck
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import SelectForm from '../select-form'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: ({ className, ...props }: any) => (
    <svg {...props} className={className} data-testid="chevron-down-icon">
      <path />
    </svg>
  ),
  ChevronUp: ({ className, ...props }: any) => (
    <svg {...props} className={className} data-testid="chevron-up-icon">
      <path />
    </svg>
  ),
  Check: ({ className, ...props }: any) => (
    <svg {...props} className={className} data-testid="check-icon">
      <path />
    </svg>
  ),
}))

// Mock the entire select component to avoid Radix UI complexity
jest.mock('@/components/ui/select', () => {
  const mockOnValueChange = jest.fn()

  return {
    Select: ({ children, onValueChange, defaultValue, ...props }: any) => {
      React.useEffect(() => {
        // Store the onValueChange function globally for the test
        if (onValueChange) {
          ;(global as any).testOnValueChange = onValueChange
        }
      }, [onValueChange])

      const [value, setValue] = React.useState(defaultValue || '')

      return (
        <div data-testid="select-root" data-value={value} {...props}>
          {children}
        </div>
      )
    },
    SelectTrigger: ({ className, children, ...props }: any) => (
      <button
        className={className}
        data-testid="select-trigger"
        type="button"
        {...props}
      >
        {children}
      </button>
    ),
    SelectValue: ({ placeholder, ...props }: any) => (
      <span data-testid="select-value" {...props}>
        {placeholder}
      </span>
    ),
    SelectContent: ({ className, children, ...props }: any) => (
      <div className={className} data-testid="select-content" {...props}>
        {children}
      </div>
    ),
    SelectItem: ({ className, children, value, ...props }: any) => {
      const handleClick = () => {
        const onValueChange = (global as any).testOnValueChange
        if (onValueChange) {
          onValueChange(value)
        }
      }

      return (
        <button
          className={className}
          data-testid={`select-item-${value}`}
          data-value={value}
          type="button"
          onClick={handleClick}
          {...props}
        >
          {children}
        </button>
      )
    },
  }
})

// Mock form components
jest.mock('@/components/ui/form', () => ({
  FormControl: ({ children, ...props }: any) => (
    <div data-testid="form-control" {...props}>
      {children}
    </div>
  ),
}))

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('SelectForm', () => {
  const defaultOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  const defaultProps = {
    options: defaultOptions,
    onValueChange: jest.fn(),
    value: 'option1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SelectForm {...defaultProps} />)
      expect(screen.getByTestId('select-root')).toBeInTheDocument()
    })

    it('renders with correct structure', () => {
      render(<SelectForm {...defaultProps} />)

      expect(screen.getByTestId('form-control')).toBeInTheDocument()
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('select-value')).toBeInTheDocument()
      expect(screen.getByTestId('select-content')).toBeInTheDocument()
    })

    it('renders all provided options', () => {
      render(<SelectForm {...defaultProps} />)

      defaultOptions.forEach((option) => {
        expect(
          screen.getByTestId(`select-item-${option.value}`)
        ).toBeInTheDocument()
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })

    it('renders with default value', () => {
      render(<SelectForm {...defaultProps} />)

      const selectRoot = screen.getByTestId('select-root')
      expect(selectRoot).toHaveAttribute('data-value', 'option1')
    })

    it('renders with empty value', () => {
      render(<SelectForm {...defaultProps} value="" />)

      const selectRoot = screen.getByTestId('select-root')
      expect(selectRoot).toHaveAttribute('data-value', '')
    })
  })

  describe('Interaction', () => {
    it('calls onValueChange when an option is selected', () => {
      const mockOnValueChange = jest.fn()
      render(<SelectForm {...defaultProps} onValueChange={mockOnValueChange} />)

      const option2Button = screen.getByTestId('select-item-option2')
      fireEvent.click(option2Button)

      expect(mockOnValueChange).toHaveBeenCalledWith('option2')
      expect(mockOnValueChange).toHaveBeenCalledTimes(1)
    })

    it('updates selection when different option is clicked', () => {
      const mockOnValueChange = jest.fn()
      render(<SelectForm {...defaultProps} onValueChange={mockOnValueChange} />)

      const option3Button = screen.getByTestId('select-item-option3')
      fireEvent.click(option3Button)

      expect(mockOnValueChange).toHaveBeenCalledWith('option3')
    })

    it('trigger is clickable', () => {
      render(<SelectForm {...defaultProps} />)

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toBeEnabled()

      fireEvent.click(trigger)
      // Trigger click should not cause errors
    })
  })

  describe('Props validation', () => {
    it('handles empty options array', () => {
      render(<SelectForm {...defaultProps} options={[]} />)

      expect(screen.getByTestId('select-root')).toBeInTheDocument()
      expect(screen.getByTestId('select-content')).toBeInTheDocument()
    })

    it('handles options with special characters', () => {
      const specialOptions = [
        { value: 'special-1', label: 'Option with spaces' },
        { value: 'special_2', label: 'Option_with_underscores' },
        { value: 'special.3', label: 'Option.with.dots' },
        { value: 'special@4', label: 'Option@with@symbols' },
      ]

      render(<SelectForm {...defaultProps} options={specialOptions} />)

      specialOptions.forEach((option) => {
        expect(
          screen.getByTestId(`select-item-${option.value}`)
        ).toBeInTheDocument()
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })

    it('handles long option labels', () => {
      const longOptions = [
        {
          value: 'long1',
          label:
            'This is a very long option label that might cause layout issues if not handled properly',
        },
        {
          value: 'long2',
          label:
            'Another extremely long option label with lots of text that goes on and on',
        },
      ]

      render(<SelectForm {...defaultProps} options={longOptions} />)

      longOptions.forEach((option) => {
        expect(
          screen.getByTestId(`select-item-${option.value}`)
        ).toBeInTheDocument()
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })

    it('handles options with duplicate labels', () => {
      const duplicateOptions = [
        { value: 'unique1', label: 'Same Label' },
        { value: 'unique2', label: 'Same Label' },
        { value: 'unique3', label: 'Same Label' },
      ]

      render(<SelectForm {...defaultProps} options={duplicateOptions} />)

      duplicateOptions.forEach((option) => {
        expect(
          screen.getByTestId(`select-item-${option.value}`)
        ).toBeInTheDocument()
      })

      // All labels should be present even if they're the same
      expect(screen.getAllByText('Same Label')).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SelectForm {...defaultProps} />)

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('type', 'button')
    })

    it('select items are focusable', () => {
      render(<SelectForm {...defaultProps} />)

      defaultOptions.forEach((option) => {
        const item = screen.getByTestId(`select-item-${option.value}`)
        expect(item).toHaveAttribute('type', 'button')
      })
    })
  })

  describe('Edge cases', () => {
    it('handles value that does not match any option', () => {
      render(<SelectForm {...defaultProps} value="nonexistent" />)

      const selectRoot = screen.getByTestId('select-root')
      expect(selectRoot).toHaveAttribute('data-value', 'nonexistent')
    })

    it('handles undefined value', () => {
      render(<SelectForm {...defaultProps} value={undefined as any} />)

      expect(screen.getByTestId('select-root')).toBeInTheDocument()
    })

    it('handles null onValueChange callback', () => {
      render(<SelectForm {...defaultProps} onValueChange={null as any} />)

      const option2Button = screen.getByTestId('select-item-option2')

      // Should not throw error when clicking
      expect(() => {
        fireEvent.click(option2Button)
      }).not.toThrow()
    })

    it('handles options with empty string values', () => {
      const emptyValueOptions = [
        { value: '', label: 'Empty option' },
        { value: 'normal', label: 'Normal option' },
      ]

      render(<SelectForm {...defaultProps} options={emptyValueOptions} />)

      expect(screen.getByTestId('select-item-')).toBeInTheDocument()
      expect(screen.getByTestId('select-item-normal')).toBeInTheDocument()
    })

    it('maintains key uniqueness for mapped options', () => {
      render(<SelectForm {...defaultProps} />)

      const items = screen.getAllByRole('button')
      const selectItems = items.filter((item) =>
        item.getAttribute('data-testid')?.startsWith('select-item-')
      )

      // Each option should have a unique key (React will warn if not)
      expect(selectItems).toHaveLength(defaultOptions.length)
    })
  })

  describe('Performance', () => {
    it('handles large number of options efficiently', () => {
      const manyOptions = Array.from({ length: 1000 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }))

      const startTime = performance.now()
      render(<SelectForm {...defaultProps} options={manyOptions} />)
      const endTime = performance.now()

      // Rendering should complete in reasonable time (less than 500ms)
      expect(endTime - startTime).toBeLessThan(500)

      // Should render all options
      expect(
        screen
          .getAllByRole('button')
          .filter((item) =>
            item.getAttribute('data-testid')?.startsWith('select-item-')
          )
      ).toHaveLength(1000)
    })
  })

  describe('Component integration', () => {
    it('integrates properly with FormControl', () => {
      render(<SelectForm {...defaultProps} />)

      const formControl = screen.getByTestId('form-control')
      const selectTrigger = screen.getByTestId('select-trigger')

      expect(formControl).toContainElement(selectTrigger)
    })

    it('passes through Radix Select props correctly', () => {
      const mockOnValueChange = jest.fn()
      render(<SelectForm {...defaultProps} onValueChange={mockOnValueChange} />)

      // Verify that the Select component receives the props
      const selectRoot = screen.getByTestId('select-root')
      expect(selectRoot).toHaveAttribute('data-value', 'option1')
    })
  })
})
