import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import ComposeRecipientField from '../compose-recipient-field'

const mockUseRecipientSuggestions = jest.fn()
const mockHandleAdd = jest.fn()

jest.mock('@/features/address_books/hooks/use-recipient-suggestions', () => ({
  useRecipientSuggestions: (...args: unknown[]) => mockUseRecipientSuggestions(...args),
}))

jest.mock('@/components/ui/inputs/input-with-tags', () => ({
  __esModule: true,
  default: ({
    name,
    placeholder,
    value,
    onChange,
    onFocus,
  }: {
    name: string
    placeholder: string
    value?: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onFocus?: () => void
  }) => (
    <input
      data-testid={name}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={onChange}
      onFocus={onFocus}
    />
  ),
}))

describe('ComposeRecipientField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockUseRecipientSuggestions.mockReturnValue({
      suggestions: [],
      isFetching: false,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('basic rendering', () => {
    it('renders the recipient input', () => {
      render(
        <ComposeRecipientField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
        />
      )
      expect(screen.getByTestId('to')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('to.string')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('shows suggestion rows after debounce', async () => {
      mockUseRecipientSuggestions.mockReturnValue({
        suggestions: [
          { email: 'alice@example.com', name: 'Alice', source: 'contact' as const },
        ],
        isFetching: false,
      })

      render(
        <ComposeRecipientField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
        />
      )

      fireEvent.change(screen.getByTestId('to'), {
        target: { value: 'ali' },
      })
      fireEvent.focus(screen.getByTestId('to'))

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
      })
    })

    it('calls handleAdd when a suggestion is picked', async () => {
      mockUseRecipientSuggestions.mockReturnValue({
        suggestions: [
          { email: 'bob@example.com', name: 'Bob', source: 'user' as const },
        ],
        isFetching: false,
      })

      render(
        <ComposeRecipientField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
        />
      )

      fireEvent.change(screen.getByTestId('to'), {
        target: { value: 'bob' },
      })
      fireEvent.focus(screen.getByTestId('to'))

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(screen.getByText('Bob')).toBeInTheDocument()
      })

      fireEvent.mouseDown(screen.getByText('Bob'))
      expect(mockHandleAdd).toHaveBeenCalledWith('bob@example.com')
    })
  })
})
