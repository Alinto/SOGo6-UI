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
    if (!errors || !errors[name]) return null
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
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      required: 'This field is required',
      invalid_email: 'Please enter a valid email address',
      min_length: 'Minimum length is 8 characters',
      password_mismatch: 'Passwords do not match',
    }
    return translations[key] || key
  }),
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
  })

  describe('error handling', () => {
    it('should display error message when error exists', () => {
      const errors = {
        testField: {
          message: 'This field is required',
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
          message: 'This field is required',
          type: 'required',
        },
      }

      render(
        <FormWrapper errors={errors}>
          <InputWithError {...defaultProps} errors={errors} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveClass('border-destructive')
    })

    it('should not display error message when no error exists', () => {
      render(
        <FormWrapper>
          <InputWithError {...defaultProps} />
        </FormWrapper>
      )

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
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
  })

  describe('prop forwarding', () => {
    it('should forward input props', () => {
      render(
        <FormWrapper>
          <InputWithError
            {...defaultProps}
            id="test-id"
            name="test-name"
            value="test-value"
          />
        </FormWrapper>
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('id', 'test-id')
      expect(input).toHaveAttribute('name', 'test-name')
      expect(input).toHaveAttribute('value', 'test-value')
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
  })
})
