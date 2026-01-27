// @ts-nocheck
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import RadioGroupForm from '../radio-group-form'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Circle: ({ className, ...props }: any) => (
    <svg {...props} className={className} data-testid="circle-icon">
      <circle />
    </svg>
  ),
}))

// Mock the entire radio-group component to avoid Radix UI complexity
jest.mock('@/components/ui/radio-group', () => {
  const mockOnValueChange = jest.fn()

  return {
    RadioGroup: ({
      children,
      onValueChange,
      defaultValue,
      className,
      ...props
    }: any) => {
      React.useEffect(() => {
        // Store the onValueChange function globally for the test
        if (onValueChange) {
          ;(global as any).testOnValueChange = onValueChange
        }
      }, [onValueChange])

      const [value, setValue] = React.useState(defaultValue || '')

      React.useEffect(() => {
        setValue(defaultValue || '')
      }, [defaultValue])

      return (
        <div
          data-testid="radio-group-root"
          data-value={value}
          className={className}
          {...props}
        >
          {children}
        </div>
      )
    },
    RadioGroupItem: ({ value, disabled, className, ...props }: any) => {
      const handleClick = () => {
        if (disabled) return
        const onValueChange = (global as any).testOnValueChange
        if (onValueChange) {
          onValueChange(value)
        }
      }

      return (
        <button
          type="button"
          data-testid={`radio-item-${value}`}
          data-value={value}
          data-disabled={disabled}
          className={className}
          onClick={handleClick}
          disabled={disabled}
          {...props}
        >
          <div data-testid="radio-indicator">
            <svg data-testid="circle-icon">
              <circle />
            </svg>
          </div>
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
  FormItem: ({ children, className, ...props }: any) => (
    <div data-testid="form-item" className={className} {...props}>
      {children}
    </div>
  ),
  FormLabel: ({ children, ...props }: any) => (
    <label data-testid="form-label" {...props}>
      {children}
    </label>
  ),
}))

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('RadioGroupForm', () => {
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
      render(<RadioGroupForm {...defaultProps} />)
      expect(screen.getByTestId('radio-group-root')).toBeInTheDocument()
    })

    it('renders with correct structure', () => {
      render(<RadioGroupForm {...defaultProps} />)

      expect(screen.getByTestId('radio-group-root')).toBeInTheDocument()
      expect(screen.getAllByTestId('form-item')).toHaveLength(
        defaultOptions.length
      )
      expect(screen.getAllByTestId('form-control')).toHaveLength(
        defaultOptions.length
      )
      expect(screen.getAllByTestId('form-label')).toHaveLength(
        defaultOptions.length
      )
    })

    it('renders all provided options', () => {
      render(<RadioGroupForm {...defaultProps} />)

      defaultOptions.forEach((option) => {
        expect(
          screen.getByTestId(`radio-item-${option.value}`)
        ).toBeInTheDocument()
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })

    it('renders with default value', () => {
      render(<RadioGroupForm {...defaultProps} />)

      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveAttribute('data-value', 'option1')
    })

    it('renders with empty value', () => {
      render(<RadioGroupForm {...defaultProps} value="" />)

      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveAttribute('data-value', '')
    })

    it('renders with vertical layout by default', () => {
      render(<RadioGroupForm {...defaultProps} />)

      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveClass('flex-col')
      expect(radioGroup).toHaveClass('flex')
      expect(radioGroup).toHaveClass('gap-4')
    })

    it('renders with horizontal layout when horizontal prop is true', () => {
      render(<RadioGroupForm {...defaultProps} horizontal />)

      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveClass('flex-row')
      expect(radioGroup).toHaveClass('flex')
      expect(radioGroup).toHaveClass('gap-4')
    })

    it('renders form items with correct spacing classes', () => {
      render(<RadioGroupForm {...defaultProps} />)

      const formItems = screen.getAllByTestId('form-item')
      formItems.forEach((item) => {
        expect(item).toHaveClass('flex')
        expect(item).toHaveClass('items-center')
        expect(item).toHaveClass('space-y-0')
        expect(item).toHaveClass('space-x-3')
      })
    })
  })

  describe('Interaction', () => {
    it('calls onValueChange when a radio option is selected', () => {
      const mockOnValueChange = jest.fn()
      render(
        <RadioGroupForm {...defaultProps} onValueChange={mockOnValueChange} />
      )

      const option2Radio = screen.getByTestId('radio-item-option2')
      fireEvent.click(option2Radio)

      expect(mockOnValueChange).toHaveBeenCalledWith('option2')
      expect(mockOnValueChange).toHaveBeenCalledTimes(1)
    })

    it('updates selection when different option is clicked', () => {
      const mockOnValueChange = jest.fn()
      render(
        <RadioGroupForm {...defaultProps} onValueChange={mockOnValueChange} />
      )

      const option3Radio = screen.getByTestId('radio-item-option3')
      fireEvent.click(option3Radio)

      expect(mockOnValueChange).toHaveBeenCalledWith('option3')
    })

    it('does not call onValueChange when disabled radio is clicked', () => {
      const mockOnValueChange = jest.fn()
      render(
        <RadioGroupForm
          {...defaultProps}
          onValueChange={mockOnValueChange}
          disabled
        />
      )

      const option2Radio = screen.getByTestId('radio-item-option2')
      fireEvent.click(option2Radio)

      expect(mockOnValueChange).not.toHaveBeenCalled()
    })

    it('radio items are clickable when not disabled', () => {
      render(<RadioGroupForm {...defaultProps} />)

      defaultOptions.forEach((option) => {
        const radioItem = screen.getByTestId(`radio-item-${option.value}`)
        expect(radioItem).toBeEnabled()
        expect(radioItem).not.toHaveAttribute('data-disabled', 'true')
      })
    })

    it('radio items are disabled when disabled prop is true', () => {
      render(<RadioGroupForm {...defaultProps} disabled />)

      defaultOptions.forEach((option) => {
        const radioItem = screen.getByTestId(`radio-item-${option.value}`)
        expect(radioItem).toBeDisabled()
        expect(radioItem).toHaveAttribute('data-disabled', 'true')
      })
    })
  })

  describe('Props validation', () => {
    it('handles empty options array', () => {
      render(<RadioGroupForm {...defaultProps} options={[]} />)

      expect(screen.getByTestId('radio-group-root')).toBeInTheDocument()
      expect(screen.queryAllByTestId('form-item')).toHaveLength(0)
    })

    it('handles options with special characters', () => {
      const specialOptions = [
        { value: 'special-1', label: 'Option with spaces' },
        { value: 'special_2', label: 'Option_with_underscores' },
        { value: 'special.3', label: 'Option.with.dots' },
        { value: 'special@4', label: 'Option@with@symbols' },
      ]

      render(<RadioGroupForm {...defaultProps} options={specialOptions} />)

      specialOptions.forEach((option) => {
        expect(
          screen.getByTestId(`radio-item-${option.value}`)
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

      render(<RadioGroupForm {...defaultProps} options={longOptions} />)

      longOptions.forEach((option) => {
        expect(
          screen.getByTestId(`radio-item-${option.value}`)
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

      render(<RadioGroupForm {...defaultProps} options={duplicateOptions} />)

      duplicateOptions.forEach((option) => {
        expect(
          screen.getByTestId(`radio-item-${option.value}`)
        ).toBeInTheDocument()
      })

      // All labels should be present even if they're the same
      expect(screen.getAllByText('Same Label')).toHaveLength(3)
    })

    it('handles boolean props correctly', () => {
      const { rerender } = render(<RadioGroupForm {...defaultProps} />)

      // Test disabled=false
      rerender(<RadioGroupForm {...defaultProps} disabled={false} />)
      defaultOptions.forEach((option) => {
        const radioItem = screen.getByTestId(`radio-item-${option.value}`)
        expect(radioItem).toBeEnabled()
      })

      // Test disabled=true
      rerender(<RadioGroupForm {...defaultProps} disabled={true} />)
      defaultOptions.forEach((option) => {
        const radioItem = screen.getByTestId(`radio-item-${option.value}`)
        expect(radioItem).toBeDisabled()
      })

      // Test horizontal=false
      rerender(<RadioGroupForm {...defaultProps} horizontal={false} />)
      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveClass('flex-col')

      // Test horizontal=true
      rerender(<RadioGroupForm {...defaultProps} horizontal={true} />)
      expect(radioGroup).toHaveClass('flex-row')
    })
  })

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<RadioGroupForm {...defaultProps} />)

      defaultOptions.forEach((option) => {
        const radioItem = screen.getByTestId(`radio-item-${option.value}`)
        const label = screen.getByText(option.label)

        expect(radioItem).toHaveAttribute('type', 'button')
        expect(label).toBeInTheDocument()
      })
    })

    it('radio items are focusable when not disabled', () => {
      render(<RadioGroupForm {...defaultProps} />)

      defaultOptions.forEach((option) => {
        const radioItem = screen.getByTestId(`radio-item-${option.value}`)
        expect(radioItem).toHaveAttribute('type', 'button')
        expect(radioItem).not.toBeDisabled()
      })
    })

    it('radio items are not focusable when disabled', () => {
      render(<RadioGroupForm {...defaultProps} disabled />)

      defaultOptions.forEach((option) => {
        const radioItem = screen.getByTestId(`radio-item-${option.value}`)
        expect(radioItem).toBeDisabled()
      })
    })

    it('has proper label association', () => {
      render(<RadioGroupForm {...defaultProps} />)

      defaultOptions.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })
  })

  describe('Edge cases', () => {
    it('handles value that does not match any option', () => {
      render(<RadioGroupForm {...defaultProps} value="nonexistent" />)

      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveAttribute('data-value', 'nonexistent')
    })

    it('handles undefined value', () => {
      render(<RadioGroupForm {...defaultProps} value={undefined as any} />)

      expect(screen.getByTestId('radio-group-root')).toBeInTheDocument()
    })

    it('handles null onValueChange callback', () => {
      render(<RadioGroupForm {...defaultProps} onValueChange={null as any} />)

      const option2Radio = screen.getByTestId('radio-item-option2')

      // Should not throw error when clicking
      expect(() => {
        fireEvent.click(option2Radio)
      }).not.toThrow()
    })

    it('handles options with empty string values', () => {
      const emptyValueOptions = [
        { value: '', label: 'Empty option' },
        { value: 'normal', label: 'Normal option' },
      ]

      render(<RadioGroupForm {...defaultProps} options={emptyValueOptions} />)

      expect(screen.getByTestId('radio-item-')).toBeInTheDocument()
      expect(screen.getByTestId('radio-item-normal')).toBeInTheDocument()
    })

    it('maintains key uniqueness for mapped options', () => {
      render(<RadioGroupForm {...defaultProps} />)

      const radioItems = screen.getAllByRole('button')
      const radioGroupItems = radioItems.filter((item) =>
        item.getAttribute('data-testid')?.startsWith('radio-item-')
      )

      // Each option should have a unique key (React will warn if not)
      expect(radioGroupItems).toHaveLength(defaultOptions.length)
    })

    it('handles undefined disabled prop', () => {
      render(<RadioGroupForm {...defaultProps} disabled={undefined} />)

      defaultOptions.forEach((option) => {
        const radioItem = screen.getByTestId(`radio-item-${option.value}`)
        expect(radioItem).toBeEnabled()
      })
    })

    it('handles undefined horizontal prop', () => {
      render(<RadioGroupForm {...defaultProps} horizontal={undefined} />)

      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveClass('flex-col') // Should default to vertical
    })
  })

  describe('Component integration', () => {
    it('integrates properly with form components', () => {
      render(<RadioGroupForm {...defaultProps} />)

      defaultOptions.forEach((option) => {
        const formItem =
          screen.getAllByTestId('form-item')[defaultOptions.indexOf(option)]
        const formControl =
          screen.getAllByTestId('form-control')[defaultOptions.indexOf(option)]
        const formLabel =
          screen.getAllByTestId('form-label')[defaultOptions.indexOf(option)]
        const radioItem = screen.getByTestId(`radio-item-${option.value}`)

        expect(formItem).toContainElement(formControl)
        expect(formItem).toContainElement(formLabel)
        expect(formControl).toContainElement(radioItem)
      })
    })

    it('passes through RadioGroup props correctly', () => {
      const mockOnValueChange = jest.fn()
      render(
        <RadioGroupForm {...defaultProps} onValueChange={mockOnValueChange} />
      )

      // Verify that the RadioGroup component receives the props
      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveAttribute('data-value', 'option1')
    })

    it('applies custom className to RadioGroup', () => {
      render(<RadioGroupForm {...defaultProps} horizontal />)

      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveClass('flex-row')
      expect(radioGroup).toHaveClass('flex')
      expect(radioGroup).toHaveClass('gap-4')
    })
  })

  describe('Layout variations', () => {
    it('applies correct layout classes for vertical orientation', () => {
      render(<RadioGroupForm {...defaultProps} horizontal={false} />)

      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveClass('flex-col flex gap-4')
    })

    it('applies correct layout classes for horizontal orientation', () => {
      render(<RadioGroupForm {...defaultProps} horizontal={true} />)

      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup).toHaveClass('flex-row flex gap-4')
    })

    it('handles className utility function correctly', () => {
      // Test that cn utility is being called properly
      render(<RadioGroupForm {...defaultProps} horizontal />)
    
      const radioGroup = screen.getByTestId('radio-group-root')
      expect(radioGroup.className).toContain('flex-row')
      expect(radioGroup.className).toContain('flex-wrap')
      expect(radioGroup.className).toContain('flex')
      expect(radioGroup.className).toContain('gap-4')
    })
    
  })
})
