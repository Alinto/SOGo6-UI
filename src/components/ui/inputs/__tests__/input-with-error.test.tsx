import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import InputWithError from '../input-with-error'

// Mock the Input component
jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, any>(
    ({ className, ...props }: any, ref) => (
      <input ref={ref} data-testid="input" className={className} {...props} />
    )
  ),
}))

// Mock the ErrorMessage component
jest.mock('@hookform/error-message', () => ({
  ErrorMessage: ({ errors, name, render }: any) => {
    if (!errors || !errors[name] || !errors[name].message) return null
    if (render) {
      const element = render({ message: errors[name].message })
      // Add data-testid to the rendered element
      return React.cloneElement(element, {
        ...element.props,
        'data-testid': 'error-message',
      })
    }
    return <span data-testid="error-message">{errors[name].message}</span>
  },
}))

// Mock the utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Mock next-intl
const mockUseTranslations = jest.fn()
jest.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations,
}))

// Wrapper component to provide form context
const FormWrapper = ({
  children,
  errors = {},
}: {
  children: React.ReactNode
  errors?: any
}) => {
  const methods = useForm()

  // Mock formState with errors
  methods.formState = {
    ...methods.formState,
    errors,
  }

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('InputWithError Component', () => {
  const defaultProps = {
    errorName: 'testField',
    placeholder: 'Enter text',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the translation mock to default behavior
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        required: 'This field is required',
        invalid_email: 'Please enter a valid email address',
        min_length: 'Minimum length is 8 characters',
        password_mismatch: 'Passwords do not match',
        'validation.error': 'Validation error occurred',
      }
      return translations[key] || key
    })
  })

  describe('basic rendering', () => {
    it('should render input without errors', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Enter text')
    })

    it('should render with custom className', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} className="custom-class" />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveClass('custom-class')
    })

    it('should render with type prop', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} type="password" />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should render with disabled state', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} disabled />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toBeDisabled()
    })

    it('should render with default flex class', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveClass('flex')
    })

    it('should match snapshot without errors', () => {
      const { container } = render(
        <FormWrapper>
          <InputWithError {...defaultProps} />
        </FormWrapper>
      )

      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('error handling', () => {
    it('should display error message when error exists', () => {
      const errors = {
        testField: {
          message: 'required',
          type: 'required',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'This field is required'
      )
    })

    it('should apply error styling when error exists', () => {
      const errors = {
        testField: {
          message: 'required',
          type: 'required',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveClass('border-destructive', 'border')
    })

    it('should not display error message when no error exists', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} />
        </FormWrapper>
      )

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })

    it('should handle different error types', () => {
      const errors = {
        testField: {
          message: 'invalid_email',
          type: 'pattern',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Please enter a valid email address'
      )
    })

    it('should handle custom error messages', () => {
      const errors = {
        testField: {
          message: 'custom_error_key',
          type: 'custom',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'custom_error_key'
      )
    })

    it('should not apply error styling when no error exists', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).not.toHaveClass('border-destructive')
    })

    it('should handle different error names', () => {
      const errors = {
        differentField: {
          message: 'required',
          type: 'required',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError
            {...defaultProps}
            errorName="differentField"
            errors={errors}
          />
        </FormWrapper>
      )

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'This field is required'
      )
    })

    it('should match snapshot with errors', () => {
      const errors = {
        testField: {
          message: 'required',
          type: 'required',
        },
      }

      const { container } = render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should properly combine custom className with error styling', () => {
      const errors = {
        testField: {
          message: 'required',
          type: 'required',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError
            {...defaultProps}
            errors={errors}
            className="custom-class another-class"
          />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveClass(
        'flex',
        'border-destructive',
        'border',
        'custom-class',
        'another-class'
      )
    })
  })

  describe('user interaction', () => {
    it('should handle user input', async () => {
      const user = userEvent.setup()

      render(
        <FormWrapper>
          <InputWithError {...defaultProps} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      await user.type(input, 'test input')

      expect(input).toHaveValue('test input')
    })

    it('should handle onChange callback', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()

      render(
        <FormWrapper>
          <InputWithError {...defaultProps} onChange={onChange} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      await user.type(input, 'a')

      expect(onChange).toHaveBeenCalled()
    })

    it('should handle onFocus callback', async () => {
      const user = userEvent.setup()
      const onFocus = jest.fn()

      render(
        <FormWrapper>
          <InputWithError {...defaultProps} onFocus={onFocus} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      await user.click(input)

      expect(onFocus).toHaveBeenCalled()
    })

    it('should handle onBlur callback', async () => {
      const user = userEvent.setup()
      const onBlur = jest.fn()

      render(
        <FormWrapper>
          <InputWithError {...defaultProps} onBlur={onBlur} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      await user.click(input)
      await user.tab()

      expect(onBlur).toHaveBeenCalled()
    })

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <FormWrapper>
          <InputWithError {...defaultProps} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      await user.tab()

      expect(input).toHaveFocus()
    })

    it('should handle clear input', async () => {
      const user = userEvent.setup()

      render(
        <FormWrapper>
          <InputWithError {...defaultProps} defaultValue="initial text" />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      await user.clear(input)

      expect(input).toHaveValue('')
    })
  })

  describe('prop forwarding', () => {
    it('should forward input props', () => {
      render(
        <FormWrapper>
          <InputWithError
            {...defaultProps}
            id="test-id"
            name="test-name"
            defaultValue="test-value"
          />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('id', 'test-id')
      expect(input).toHaveAttribute('name', 'test-name')
      expect(input).toHaveValue('test-value')
    })

    it('should forward all valid HTML input attributes', () => {
      const emailPattern = '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'

      render(
        <FormWrapper>
          <InputWithError
            {...defaultProps}
            autoComplete="email"
            autoFocus
            maxLength={100}
            minLength={5}
            pattern={emailPattern}
            required
            tabIndex={1}
          />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('autocomplete', 'email')
      expect(input).toHaveAttribute('maxlength', '100')
      expect(input).toHaveAttribute('minlength', '5')
      expect(input).toHaveAttribute('pattern', emailPattern)
      expect(input).toHaveAttribute('required')
      expect(input).toHaveAttribute('tabindex', '1')
    })

    it('should handle readOnly prop', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} readOnly />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('readonly')
    })

    it('should handle defaultValue prop', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} defaultValue="default text" />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveValue('default text')
    })
  })

  describe('edge cases', () => {
    it('should handle missing errorName prop', () => {
      const props = { ...defaultProps }
      delete (props as any).errorName

      render(
        <FormWrapper>
          <InputWithError {...props} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
    })

    it('should handle undefined errors object', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} errors={undefined} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })

    it('should handle null errors object', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} errors={null as any} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })

    it('should handle empty errors object', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} errors={{}} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })

    it('should handle error with missing message', () => {
      const errors = {
        testField: {
          type: 'required',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      // Error message should not be displayed if message is missing
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })

    it('should handle very long error messages', () => {
      const longMessage = 'a'.repeat(1000)
      const errors = {
        testField: {
          message: longMessage,
          type: 'custom',
        },
      }

      // Mock the translation to return the long message
      mockUseTranslations.mockImplementation((key: string) => key)

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      expect(screen.getByTestId('error-message')).toHaveTextContent(longMessage)
    })

    it('should handle special characters in error messages', () => {
      const specialMessage = 'Error with symbols: !@#$%^&*()_+-=[]{}|;:,.<>?'
      const errors = {
        testField: {
          message: specialMessage,
          type: 'custom',
        },
      }

      // Mock the translation to return the special message
      mockUseTranslations.mockImplementation((key: string) => key)

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        specialMessage
      )
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes when error exists', () => {
      const errors = {
        testField: {
          message: 'required',
          type: 'required',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      const errorMessage = screen.getByTestId('error-message')

      expect(input).toBeInTheDocument()
      expect(errorMessage).toBeInTheDocument()
    })

    it('should support screen readers with error messages', () => {
      const errors = {
        testField: {
          message: 'required',
          type: 'required',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveClass('text-destructive', 'text-sm')
    })
  })

  describe('internationalization', () => {
    it('should call useTranslations hook', () => {
      const errors = {
        testField: {
          message: 'required',
          type: 'required',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      expect(mockUseTranslations).toHaveBeenCalled()
    })

    it('should translate error messages', () => {
      const errors = {
        testField: {
          message: 'validation.error',
          type: 'custom',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Validation error occurred'
      )
    })

    it('should handle missing translation keys gracefully', () => {
      const errors = {
        testField: {
          message: 'non_existent_key',
          type: 'custom',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      // Should display the key itself when translation is not found
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'non_existent_key'
      )
    })
  })
})
