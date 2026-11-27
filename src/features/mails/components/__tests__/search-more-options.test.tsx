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

const mockAllCategories = jest.fn(
  (): { name: string; color: string; is_default: boolean }[] => []
)
jest.mock('../../hooks/use-mail-category-picker', () => ({
  useMailCategoryPicker: () => ({ allCategories: mockAllCategories() }),
}))

type MockOption = { value: string; label: string; color?: string }
const mockMultiSelect = jest.fn()
jest.mock('@/components/ui/combomultiple', () => ({
  MultiSelect: (props: { options: MockOption[]; placeholder?: string }) => {
    mockMultiSelect(props)
    return <div data-testid={props.placeholder} />
  },
}))

const labelOptions = (): MockOption[] => {
  const calls = mockMultiSelect.mock.calls.filter(
    ([props]) => props.placeholder === 'search.labels.placeholder.string'
  )
  return calls[calls.length - 1][0].options
}

const mockUseGetMailboxTagsQuery = jest.fn(
  (_args: unknown, _options?: unknown) => ({ data: undefined })
)
jest.mock('../../store/mails-api', () => ({
  useGetMailboxTagsQuery: (args: unknown, options?: unknown) =>
    mockUseGetMailboxTagsQuery(args, options),
}))

const mockUseRecipientSuggestions = jest.fn()
jest.mock('@/features/address_books/hooks/use-recipient-suggestions', () => ({
  useRecipientSuggestions: (...args: unknown[]) =>
    mockUseRecipientSuggestions(...args),
}))

jest.mock('@/features/address_books/hooks/use-recipient-photos', () => ({
  useRecipientPhotos: jest.fn(() => new Map()),
}))

jest.mock('@/features/address_books/hooks/use-share-user-suggestions', () => ({
  useShareUserSuggestions: () => ({ suggestions: [], isFetching: false }),
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
  accountId,
}: {
  onValuesChange?: (values: SearchFormValues) => void
  accountId?: string
}) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: defaultSearchFormValues,
  })
  onValuesChange?.(form.getValues())
  return (
    <Form {...form}>
      <SearchMoreOptions form={form} open accountId={accountId} />
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

describe('SearchMoreOptions — mailbox tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRecipientSuggestions.mockReturnValue({
      suggestions: [],
      isFetching: false,
    })
  })

  it('loads the tags of the searched mailbox', () => {
    render(<TestHost accountId="1" />)
    expect(mockUseGetMailboxTagsQuery).toHaveBeenCalledWith(
      { accountId: '1' },
      { skip: false }
    )
  })

  it('skips the tags request without an account', () => {
    render(<TestHost />)
    expect(mockUseGetMailboxTagsQuery).toHaveBeenCalledWith(
      { accountId: '' },
      { skip: true }
    )
  })
})

describe('SearchMoreOptions — label options', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAllCategories.mockReturnValue([])
    mockUseRecipientSuggestions.mockReturnValue({
      suggestions: [],
      isFetching: false,
    })
  })

  it('shows the tag colors, with the theme color as fallback', () => {
    mockUseGetMailboxTagsQuery.mockReturnValue({
      data: [
        { name: 'toto', color: '#22c55e', is_default: false },
        { name: 'Facture', color: '', is_default: false },
        { name: 'tutu', is_default: false },
      ],
    } as never)
    render(<TestHost accountId="0" />)
    expect(labelOptions()).toEqual([
      { value: 'toto', label: 'toto', color: '#22c55e' },
      { value: 'Facture', label: 'Facture', color: 'hsl(var(--primary))' },
      { value: 'tutu', label: 'tutu', color: 'hsl(var(--primary))' },
    ])
  })

  it('translates default tags and keeps their raw name as value', () => {
    mockUseGetMailboxTagsQuery.mockReturnValue({
      data: [
        { name: 'Work', color: '#8b5cf6', is_default: true },
        { name: '56', color: '#ef4444', is_default: false },
      ],
    } as never)
    render(<TestHost accountId="0" />)
    expect(labelOptions()).toEqual([
      { value: 'Work', label: 'labels.Work', color: '#8b5cf6' },
      { value: '56', label: '56', color: '#ef4444' },
    ])
  })

  it('lists the user categories before the mailbox tags', () => {
    mockAllCategories.mockReturnValue([
      { name: 'Family', color: '#eab308', is_default: true },
    ])
    mockUseGetMailboxTagsQuery.mockReturnValue({
      data: [
        { name: 'family', color: '#000000', is_default: false },
        { name: 'toto', color: '#22c55e', is_default: false },
      ],
    } as never)
    render(<TestHost accountId="0" />)
    expect(labelOptions()).toEqual([
      { value: 'Family', label: 'labels.Family', color: '#eab308' },
      { value: 'toto', label: 'toto', color: '#22c55e' },
    ])
  })
})
