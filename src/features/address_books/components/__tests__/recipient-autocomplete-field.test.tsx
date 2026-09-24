import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import RecipientAutocompleteField from '../recipient-autocomplete-field'

const mockUseRecipientSuggestions = jest.fn()
const mockHandleAdd = jest.fn()

jest.mock('@/features/address_books/hooks/use-recipient-suggestions', () => ({
  useRecipientSuggestions: (...args: unknown[]) =>
    mockUseRecipientSuggestions(...args),
}))

jest.mock('@/components/ui/inputs/input-with-tags', () => ({
  __esModule: true,
  default: ({
    name,
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    disabled,
  }: {
    name: string
    placeholder: string
    value?: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onFocus?: () => void
    onBlur?: () => void
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
    disabled?: boolean
  }) => (
    <input
      data-testid={name}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      disabled={disabled}
    />
  ),
}))

const defaultProps = {
  loadingLabel: 'Searching recipients…',
  getAddDirectLabel: (email: string) => `Add "${email}"`,
}

describe('RecipientAutocompleteField', () => {
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
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          {...defaultProps}
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
          {
            email: 'alice@example.com',
            name: 'Alice',
            source: 'contact' as const,
          },
        ],
        isFetching: false,
      })

      render(
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          {...defaultProps}
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
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          {...defaultProps}
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
      expect(mockHandleAdd).toHaveBeenCalledWith('bob@example.com', {
        email: 'bob@example.com',
        name: 'Bob',
        source: 'user',
      })
    })

    it('renders the caller-supplied loading label while fetching', async () => {
      mockUseRecipientSuggestions.mockReturnValue({
        suggestions: [],
        isFetching: true,
      })

      render(
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          {...defaultProps}
        />
      )

      fireEvent.change(screen.getByTestId('to'), {
        target: { value: 'someone@example.com' },
      })
      fireEvent.focus(screen.getByTestId('to'))

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(screen.getByText('Searching recipients…')).toBeInTheDocument()
      })
    })

    it('renders the caller-supplied add-direct label for a typed email', async () => {
      render(
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          {...defaultProps}
        />
      )

      fireEvent.change(screen.getByTestId('to'), {
        target: { value: 'new@example.com' },
      })
      fireEvent.focus(screen.getByTestId('to'))

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(screen.getByText('Add "new@example.com"')).toBeInTheDocument()
      })
    })

    it('calls onAddDirect with the typed email when the add-direct row is clicked', async () => {
      const onAddDirect = jest.fn()
      render(
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          onAddDirect={onAddDirect}
          {...defaultProps}
        />
      )

      fireEvent.change(screen.getByTestId('to'), {
        target: { value: 'new@example.com' },
      })
      fireEvent.focus(screen.getByTestId('to'))

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      fireEvent.mouseDown(await screen.findByText('Add "new@example.com"'))
      expect(mockHandleAdd).toHaveBeenCalledWith('new@example.com', undefined)
      expect(onAddDirect).toHaveBeenCalledWith('new@example.com')
    })

    it('does not call onAddDirect when the typed email is added on blur', () => {
      const onAddDirect = jest.fn()
      render(
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          onAddDirect={onAddDirect}
          {...defaultProps}
        />
      )

      fireEvent.change(screen.getByTestId('to'), {
        target: { value: 'new@example.com' },
      })
      fireEvent.blur(screen.getByTestId('to'))

      expect(mockHandleAdd).toHaveBeenCalledWith('new@example.com')
      expect(onAddDirect).not.toHaveBeenCalled()
    })

    it('does not call onAddDirect when an existing suggestion is picked', async () => {
      const onAddDirect = jest.fn()
      mockUseRecipientSuggestions.mockReturnValue({
        suggestions: [
          { email: 'bob@example.com', name: 'Bob', source: 'contact' },
        ],
        isFetching: false,
      })
      render(
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          onAddDirect={onAddDirect}
          {...defaultProps}
        />
      )

      fireEvent.change(screen.getByTestId('to'), { target: { value: 'bo' } })
      fireEvent.focus(screen.getByTestId('to'))

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      fireEvent.mouseDown(await screen.findByText('Bob'))
      expect(mockHandleAdd).toHaveBeenCalled()
      expect(onAddDirect).not.toHaveBeenCalled()
    })

    it('does not offer to add a non-email value by default (compose only sends real addresses)', async () => {
      render(
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          {...defaultProps}
        />
      )

      fireEvent.change(screen.getByTestId('to'), {
        target: { value: 'jane' },
      })
      fireEvent.focus(screen.getByTestId('to'))

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      expect(screen.queryByText('Add "jane"')).not.toBeInTheDocument()

      fireEvent.blur(screen.getByTestId('to'))
      expect(mockHandleAdd).not.toHaveBeenCalled()
    })

    it('offers to add a non-email value when allowFreeText is set (used by search fields)', async () => {
      render(
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          allowFreeText
          {...defaultProps}
        />
      )

      fireEvent.change(screen.getByTestId('to'), {
        target: { value: 'jane' },
      })
      fireEvent.focus(screen.getByTestId('to'))

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(screen.getByText('Add "jane"')).toBeInTheDocument()
      })

      fireEvent.mouseDown(screen.getByText('Add "jane"'))
      expect(mockHandleAdd).toHaveBeenCalledWith('jane', undefined)
    })

    it('adds a non-email value on blur when allowFreeText is set', async () => {
      render(
        <RecipientAutocompleteField
          tags={[]}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="to"
          placeholder="to.string"
          allowFreeText
          {...defaultProps}
        />
      )

      fireEvent.change(screen.getByTestId('to'), {
        target: { value: 'jane' },
      })
      fireEvent.focus(screen.getByTestId('to'))
      fireEvent.blur(screen.getByTestId('to'))

      expect(mockHandleAdd).toHaveBeenCalledWith('jane')
    })
  })

  describe('suggestionsOnly', () => {
    const bob = {
      email: 'bob@example.com',
      name: 'Bob',
      source: 'contact' as const,
    }

    const renderSuggestionsOnly = (
      tags: { id: string; value: string }[] = []
    ) =>
      render(
        <RecipientAutocompleteField
          tags={tags}
          remove={jest.fn()}
          handleAdd={mockHandleAdd}
          name="share"
          placeholder="share.placeholder"
          suggestionsOnly
          {...defaultProps}
        />
      )

    const typeAndWait = async (value: string) => {
      fireEvent.change(screen.getByTestId('share'), { target: { value } })
      fireEvent.focus(screen.getByTestId('share'))
      await act(async () => {
        jest.advanceTimersByTime(300)
      })
    }

    it('queries suggestions with the typed text', async () => {
      renderSuggestionsOnly()
      await typeAndWait('bo')
      expect(mockUseRecipientSuggestions).toHaveBeenLastCalledWith('bo')
    })

    it('never offers to add the typed text, nor adds it on blur', async () => {
      renderSuggestionsOnly()
      await typeAndWait('new@example.com')

      expect(
        screen.queryByText('Add "new@example.com"')
      ).not.toBeInTheDocument()

      fireEvent.blur(screen.getByTestId('share'))
      expect(mockHandleAdd).not.toHaveBeenCalled()
    })

    it('ignores Enter when no suggestion matches', async () => {
      renderSuggestionsOnly()
      await typeAndWait('unknown@example.com')

      fireEvent.keyDown(screen.getByTestId('share'), { key: 'Enter' })
      expect(mockHandleAdd).not.toHaveBeenCalled()
    })

    it('picks the first suggestion on Enter', async () => {
      mockUseRecipientSuggestions.mockReturnValue({
        suggestions: [bob],
        isFetching: false,
      })
      renderSuggestionsOnly()
      await typeAndWait('bo')

      await waitFor(() => {
        expect(screen.getByText('Bob')).toBeInTheDocument()
      })
      fireEvent.keyDown(screen.getByTestId('share'), { key: 'Enter' })
      expect(mockHandleAdd).toHaveBeenCalledWith('bob@example.com', bob)
    })
  })
})
