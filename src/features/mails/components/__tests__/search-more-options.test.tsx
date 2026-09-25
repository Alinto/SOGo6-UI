import { Form } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import {
  defaultSearchFormValues,
  searchFormSchema,
  type SearchFormValues,
} from '../../utils/mail-search-form'
import SearchMoreOptions from '../search-more-options'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { email?: string }) =>
    params?.email ? `${key}:${params.email}` : key,
}))

jest.mock('../../hooks/use-mail-category-picker', () => ({
  useMailCategoryPicker: () => ({ allCategories: [] }),
}))

const mockUseRecipientSuggestions = jest.fn()
jest.mock('@/features/address_books/hooks/use-recipient-suggestions', () => ({
  useRecipientSuggestions: (...args: unknown[]) =>
    mockUseRecipientSuggestions(...args),
}))

// The real Tag/InputWithTags chain pulls in lucide-react's dynamic-icon
// entrypoint, which is ESM-only and unparseable under this project's Jest
// transform config — swap in a plain-DOM stand-in, same as
// recipient-autocomplete-field.test.tsx does.
jest.mock('@/components/ui/inputs/input-with-tags', () => ({
  __esModule: true,
  default: ({
    name,
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    tags,
    remove,
  }: {
    name: string
    placeholder: string
    value?: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onFocus?: () => void
    onBlur?: () => void
    tags: { id: string; value: string }[]
    remove: (index: number) => void
  }) => (
    <div>
      {tags.map((tag, i) => (
        <span key={tag.id}>
          {tag.value}
          <button type="button" onClick={() => remove(i)}>
            remove
          </button>
        </span>
      ))}
      <input
        data-testid={name}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  ),
}))

function TestHost({
  onValuesChange,
}: {
  onValuesChange?: (values: SearchFormValues) => void
}) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: defaultSearchFormValues,
  })
  onValuesChange?.(form.getValues())
  return (
    <Form {...form}>
      <SearchMoreOptions form={form} open />
    </Form>
  )
}

describe('SearchMoreOptions — from/to/bcc autocomplete', () => {
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

  it('renders the from/to/bcc fields as tag inputs instead of plain text inputs', () => {
    render(<TestHost />)
    expect(screen.getByPlaceholderText('from.string')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('search.to_or_cc.string')
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('bcc.string')).toBeInTheDocument()
  })

  it('shows contact/user suggestions when typing in the "from" field', async () => {
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

    render(<TestHost />)
    const fromInput = screen.getByPlaceholderText('from.string')
    fireEvent.change(fromInput, { target: { value: 'ali' } })
    fireEvent.focus(fromInput)

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByText('<Alice>')).toBeInTheDocument()
    })
  })

  it('adds a removable tag to the RHF field array when a suggestion is picked', async () => {
    mockUseRecipientSuggestions.mockReturnValue({
      suggestions: [
        { email: 'bob@example.com', name: 'Bob', source: 'user' as const },
      ],
      isFetching: false,
    })

    let latestValues: SearchFormValues | undefined
    render(<TestHost onValuesChange={(values) => (latestValues = values)} />)

    const toInput = screen.getByPlaceholderText('search.to_or_cc.string')
    fireEvent.change(toInput, { target: { value: 'bob' } })
    fireEvent.focus(toInput)

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByText('<Bob>')).toBeInTheDocument()
    })

    fireEvent.mouseDown(screen.getByText('<Bob>'))

    await waitFor(() => {
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })
    expect(Array.isArray(latestValues?.to)).toBe(true)
  })

  it('allows adding a partial/non-email value (search values are not restricted to full addresses)', async () => {
    render(<TestHost />)

    const fromInput = screen.getByPlaceholderText('from.string')
    fireEvent.change(fromInput, { target: { value: 'jane' } })
    fireEvent.focus(fromInput)

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    fireEvent.blur(fromInput)

    await waitFor(() => {
      expect(screen.getByText('jane')).toBeInTheDocument()
    })
  })

  it('does not offer to add an unknown address as typed', async () => {
    render(<TestHost />)

    for (const placeholder of [
      'from.string',
      'search.to_or_cc.string',
      'bcc.string',
    ]) {
      const input = screen.getByPlaceholderText(placeholder)
      fireEvent.change(input, { target: { value: 'unknown@example.com' } })
      fireEvent.focus(input)

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      expect(
        screen.queryByText(
          'recipient_search.add_direct.string:unknown@example.com'
        )
      ).not.toBeInTheDocument()
    }
  })
})
