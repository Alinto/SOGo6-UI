import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import InputWithTags from '../input-with-tags'

// Mock the Tag component
jest.mock('@/components/ui/tag', () => ({
  __esModule: true,
  default: ({ value, action }: any) => (
    <div data-testid="tag">
      <span>{value}</span>
      <button onClick={action} data-testid="remove-tag">
        Remove
      </button>
    </div>
  ),
}))

// Mock the InputWithError component
jest.mock('../input-with-error', () => ({
  __esModule: true,
  default: React.forwardRef(
    ({ errorName, errors, ...props }: any, ref: any) => {
      // Filter out react-hook-form specific props that shouldn't go to DOM
      const {
        errorName: _,
        errors: __,
        ...domProps
      } = { errorName, errors, ...props }
      return <input ref={ref} data-testid="input-with-error" {...domProps} />
    }
  ),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Form wrapper for context
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm()
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('InputWithTags Component', () => {
  const mockTags = [
    { id: '1', value: 'tag1@example.com' },
    { id: '2', value: 'tag2@example.com' },
  ]

  const defaultProps = {
    tags: mockTags,
    remove: jest.fn(),
    handleAdd: jest.fn(),
    placeholder: 'Enter tags',
    value: '',
    onChange: jest.fn(),
    name: 'tags',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render all tags', () => {
      render(
        <FormWrapper>
          <InputWithTags {...defaultProps} />
        </FormWrapper>
      )

      const tags = screen.getAllByTestId('tag')
      expect(tags).toHaveLength(2)
      expect(screen.getByText('tag1@example.com')).toBeInTheDocument()
      expect(screen.getByText('tag2@example.com')).toBeInTheDocument()
    })

    it('should render input with error component', () => {
      render(
        <FormWrapper>
          <InputWithTags {...defaultProps} />
        </FormWrapper>
      )

      expect(screen.getByTestId('input-with-error')).toBeInTheDocument()
    })

    it('should render with empty tags array', () => {
      render(
        <FormWrapper>
          <InputWithTags {...defaultProps} tags={[]} />
        </FormWrapper>
      )

      expect(screen.queryByTestId('tag')).not.toBeInTheDocument()
      expect(screen.getByTestId('input-with-error')).toBeInTheDocument()
    })
  })

  describe('tag management', () => {
    it('should call remove function when tag remove button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <FormWrapper>
          <InputWithTags {...defaultProps} />
        </FormWrapper>
      )

      const removeButtons = screen.getAllByTestId('remove-tag')
      await user.click(removeButtons[0])

      expect(defaultProps.remove).toHaveBeenCalledWith(0)
    })

    it('should call handleAdd when Enter key is pressed with input value', () => {
      const mockHandleAdd = jest.fn()

      render(
        <FormWrapper>
          <InputWithTags {...defaultProps} handleAdd={mockHandleAdd} />
        </FormWrapper>
      )

      // The onKeyDown handler is defined in the component, so let's test the logic directly
      // First get the input element
      const input = screen.getByTestId('input-with-error')

      // Set a value on the input
      Object.defineProperty(input, 'value', {
        value: 'newtag@example.com',
        writable: true,
      })

      // Create a properly structured event
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      })

      // Add currentTarget.value to the event
      Object.defineProperty(event, 'currentTarget', {
        value: { value: 'newtag@example.com' },
        writable: false,
      })

      // Spy on preventDefault and stopPropagation
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation')

      // Dispatch the event
      input.dispatchEvent(event)

      expect(mockHandleAdd).toHaveBeenCalledWith('newtag@example.com')
    })

    it('should not call handleAdd when Enter key is pressed with empty input', async () => {
      const user = userEvent.setup()

      render(
        <FormWrapper>
          <InputWithTags {...defaultProps} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input-with-error')
      await user.click(input)
      await user.keyboard('{Enter}')

      expect(defaultProps.handleAdd).not.toHaveBeenCalled()
    })
  })

  describe('keyboard interaction', () => {
    it('should handle other key presses normally', async () => {
      const user = userEvent.setup()

      render(
        <FormWrapper>
          <InputWithTags {...defaultProps} />
        </FormWrapper>
      )

      const input = screen.getByTestId('input-with-error')
      await user.type(input, 'a')

      expect(defaultProps.onChange).toHaveBeenCalled()
    })
  })

  describe('prop forwarding', () => {
    it('should forward props to InputWithError', () => {
      render(
        <FormWrapper>
          <InputWithTags
            {...defaultProps}
            placeholder="Custom placeholder"
            name="customName"
          />
        </FormWrapper>
      )

      const input = screen.getByTestId('input-with-error')
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder')
    })

    it('should forward additional props', () => {
      render(
        <FormWrapper>
          <InputWithTags
            {...defaultProps}
            disabled={true}
            className="custom-class"
          />
        </FormWrapper>
      )

      const input = screen.getByTestId('input-with-error')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('custom-class')
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in tag values', () => {
      const specialTags = [
        { id: '1', value: 'tag@example.com' },
        { id: '2', value: 'tag with spaces' },
        { id: '3', value: 'tag_with_underscore' },
      ]

      render(
        <FormWrapper>
          <InputWithTags {...defaultProps} tags={specialTags} />
        </FormWrapper>
      )

      expect(screen.getByText('tag@example.com')).toBeInTheDocument()
      expect(screen.getByText('tag with spaces')).toBeInTheDocument()
      expect(screen.getByText('tag_with_underscore')).toBeInTheDocument()
    })

    it('should handle large number of tags', () => {
      const largeTags = Array.from({ length: 10 }, (_, i) => ({
        id: i.toString(),
        value: `tag${i}@example.com`,
      }))

      render(
        <FormWrapper>
          <InputWithTags {...defaultProps} tags={largeTags} />
        </FormWrapper>
      )

      const tags = screen.getAllByTestId('tag')
      expect(tags).toHaveLength(10)
    })
  })
})
