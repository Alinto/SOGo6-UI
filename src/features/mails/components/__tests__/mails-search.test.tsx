import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MailsSearch } from '../mails-search'
import { clearMailSearch } from '../../store/mail-search-slice'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ account: '0', folder: 'INBOX' }),
}))

const mockDispatch = jest.fn()
const mockMailSearchState: {
  isActive: boolean
  accountId: string | null
  params: {
    text?: string
    subject?: string
    from?: string
    to?: string
    bcc?: string
    folders?: string[]
    operator?: 'AND' | 'OR'
  } | null
} = { isActive: false, accountId: null, params: null }

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ mailSearch: mockMailSearchState }),
}))

jest.mock('../../store/mails-api', () => ({
  useGetFoldersQuery: () => ({ data: [] }),
}))

jest.mock('../../hooks/use-mail-category-picker', () => ({
  useMailCategoryPicker: () => ({ allCategories: [] }),
}))

jest.mock('../search-folders', () => ({
  __esModule: true,
  default: () => null,
  flattenFolders: () => [],
}))

jest.mock('../search-more-options', () => ({
  __esModule: true,
  default: () => null,
}))

// The real MultiSelect drives a Radix popover + cmdk list, which doesn't
// reliably respond to interactions under jsdom; swap in a plain-DOM stand-in
// of checkboxes (one per option, toggled independently) for this test file.
jest.mock('@/components/ui/combomultiple', () => ({
  MultiSelect: ({
    selected,
    onChange,
    options,
  }: {
    selected: string[]
    onChange: (values: string[]) => void
    options: { value: string; label: string }[]
  }) => (
    <div data-testid="field-scope-multiselect">
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="checkbox"
            aria-label={option.label}
            checked={selected.includes(option.value)}
            onChange={() =>
              onChange(
                selected.includes(option.value)
                  ? selected.filter((v) => v !== option.value)
                  : [...selected, option.value]
              )
            }
          />
        </label>
      ))}
    </div>
  ),
}))

describe('MailsSearch', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockMailSearchState.isActive = false
    mockMailSearchState.accountId = null
    mockMailSearchState.params = null
  })

  it('renders without crashing', () => {
    expect(() => render(<MailsSearch />)).not.toThrow()
  })

  it('memoizes correctly', () => {
    const { rerender } = render(<MailsSearch />)
    expect(() => rerender(<MailsSearch />)).not.toThrow()
  })

  it('does not show a clear button when no search is active', () => {
    render(<MailsSearch />)
    expect(
      screen.queryByRole('button', { name: 'search.clear.string' })
    ).not.toBeInTheDocument()
  })

  it('shows a clear button when a search is active for this account and clears it on click', async () => {
    mockMailSearchState.isActive = true
    mockMailSearchState.accountId = '0'
    mockMailSearchState.params = { text: 'invoice' }
    const user = userEvent.setup()
    render(<MailsSearch />)

    const clearButton = screen.getByRole('button', { name: 'search.clear.string' })
    await user.click(clearButton)

    expect(mockDispatch).toHaveBeenCalledWith(clearMailSearch())
  })

  it('clears the displayed query when the search is cleared externally (e.g. by a folder change)', () => {
    mockMailSearchState.isActive = true
    mockMailSearchState.accountId = '0'
    mockMailSearchState.params = { subject: 'invoice', from: 'invoice', operator: 'OR' }

    const { rerender } = render(<MailsSearch />)
    const queryInput = screen.getByPlaceholderText(
      'search.placeholder.string'
    ) as HTMLInputElement
    expect(queryInput.value).toBe('invoice')

    // Simulate the search being cleared from outside this component, e.g.
    // useFolderMessages dispatching clearMailSearch on folder navigation.
    mockMailSearchState.isActive = false
    mockMailSearchState.accountId = null
    mockMailSearchState.params = null
    rerender(<MailsSearch />)

    expect(queryInput.value).toBe('')
  })

  it('does not show a clear button when the active search belongs to a different account', () => {
    mockMailSearchState.isActive = true
    mockMailSearchState.accountId = '1'
    mockMailSearchState.params = { text: 'invoice' }
    render(<MailsSearch />)

    expect(
      screen.queryByRole('button', { name: 'search.clear.string' })
    ).not.toBeInTheDocument()
  })

  it('shows the field scope selector directly next to the search bar, with no click needed', () => {
    render(<MailsSearch />)

    expect(screen.getByRole('checkbox', { name: 'subject.string' })).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'search.scope.sender.string' })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'search.to_or_cc.string' })
    ).not.toBeChecked()
  })

  it('does not show the advanced search bar label in simple mode', () => {
    render(<MailsSearch />)

    expect(screen.queryByText('search.advanced_bar_label.string')).not.toBeInTheDocument()
  })

  it('does not open the advanced search modal when clicking the search bar', async () => {
    const user = userEvent.setup()
    render(<MailsSearch />)

    await user.click(screen.getByPlaceholderText('search.placeholder.string'))

    expect(
      screen.queryByRole('button', { name: 'search.confirm.string' })
    ).not.toBeInTheDocument()
  })

  it('opens the advanced search modal from the "…" button, without the simple search field or scope selector', async () => {
    const user = userEvent.setup()
    render(<MailsSearch />)

    await user.click(screen.getByRole('button', { name: 'search.advanced.string' }))

    expect(
      screen.getByRole('button', { name: 'search.confirm.string' })
    ).toBeInTheDocument()
    // Only one field-scope selector and one query input exist (the ones in
    // the bar) — the modal doesn't duplicate them.
    expect(screen.getAllByTestId('field-scope-multiselect')).toHaveLength(1)
    expect(
      screen.getAllByPlaceholderText('search.placeholder.string')
    ).toHaveLength(1)
  })

  it('sends the typed query as both subject and from when "subject or sender" is selected, on Enter', async () => {
    const user = userEvent.setup()
    render(<MailsSearch />)

    const queryInput = screen.getByPlaceholderText('search.placeholder.string')
    await user.type(queryInput, 'invoice{Enter}')

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          accountId: '0',
          params: expect.objectContaining({
            subject: 'invoice',
            from: 'invoice',
            operator: 'OR',
            folders: ['INBOX'],
          }),
          folder: 'INBOX',
        }),
      })
    )
    const [{ payload }] = mockDispatch.mock.calls.at(-1)!
    expect(payload.params.text).toBeUndefined()
  })

  it('carries the typed query over to a newly selected scope instead of losing it', async () => {
    const user = userEvent.setup()
    render(<MailsSearch />)

    const queryInput = screen.getByPlaceholderText('search.placeholder.string')
    await user.type(queryInput, 'invoice')
    expect(queryInput).toHaveValue('invoice')

    // Add "to" then drop the default "subject"/"sender" scopes: the typed
    // value should follow the query box to the "to" field rather than
    // disappearing.
    await user.click(screen.getByRole('checkbox', { name: 'search.to_or_cc.string' }))
    await user.click(screen.getByRole('checkbox', { name: 'subject.string' }))
    await user.click(
      screen.getByRole('checkbox', { name: 'search.scope.sender.string' })
    )

    expect(queryInput).toHaveValue('invoice')
  })

  it('does not allow deselecting the last remaining scope', async () => {
    const user = userEvent.setup()
    render(<MailsSearch />)

    // Default is subject+sender: drop sender, then try to also drop subject.
    await user.click(
      screen.getByRole('checkbox', { name: 'search.scope.sender.string' })
    )
    await user.click(screen.getByRole('checkbox', { name: 'subject.string' }))

    expect(screen.getByRole('checkbox', { name: 'subject.string' })).toBeChecked()
  })

  it('switches to the advanced query bar (hiding the field-scope selector) once a recognized operator is typed, and applies the search on Enter', async () => {
    const user = userEvent.setup()
    render(<MailsSearch />)

    const queryInput = screen.getByPlaceholderText('search.placeholder.string')
    await user.type(queryInput, 'to:jane')

    expect(
      screen.getByPlaceholderText('search.advanced_placeholder.string')
    ).toHaveValue('to:jane')
    expect(screen.queryByTestId('field-scope-multiselect')).not.toBeInTheDocument()
    expect(screen.getByText('search.advanced_bar_label.string')).toBeInTheDocument()

    await user.type(queryInput, '{Enter}')

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          accountId: '0',
          params: expect.objectContaining({ to: 'jane' }),
          folder: 'INBOX',
        }),
      })
    )
  })

  it('switches the top bar to the advanced query bar after submitting the advanced search modal', async () => {
    const user = userEvent.setup()
    render(<MailsSearch />)

    await user.click(screen.getByRole('button', { name: 'search.advanced.string' }))
    await user.click(screen.getByRole('button', { name: 'search.confirm.string' }))

    expect(
      screen.queryByRole('button', { name: 'search.confirm.string' })
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('field-scope-multiselect')).not.toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('search.advanced_placeholder.string')
    ).toBeInTheDocument()
    expect(screen.getByText('search.advanced_bar_label.string')).toBeInTheDocument()
  })

  it('shows the advanced query bar, formatted as key:value tokens, for an active search the simple bar cannot represent', () => {
    mockMailSearchState.isActive = true
    mockMailSearchState.accountId = '0'
    mockMailSearchState.params = { subject: 'invoice', bcc: 'jane@example.com' }

    render(<MailsSearch />)

    expect(
      screen.getByPlaceholderText('search.advanced_placeholder.string')
    ).toHaveValue('subject:invoice bcc:jane@example.com')
    expect(screen.queryByTestId('field-scope-multiselect')).not.toBeInTheDocument()
    expect(screen.getByText('search.advanced_bar_label.string')).toBeInTheDocument()
  })

  it('does not prefill the advanced modal with a search that came from the simple bar', async () => {
    // Regression test: typing "tutu" in the simple bar (default "subject or
    // sender" scope) produces a search with subject/from both set to "tutu",
    // scoped to the current folder. Opening the advanced modal afterwards
    // must not carry those simple-bar values into its fields.
    const user = userEvent.setup()
    mockMailSearchState.isActive = true
    mockMailSearchState.accountId = '0'
    mockMailSearchState.params = {
      subject: 'tutu',
      from: 'tutu',
      operator: 'OR',
      folders: ['INBOX'],
    }

    render(<MailsSearch />)
    await user.click(screen.getByRole('button', { name: 'search.advanced.string' }))

    // The advanced modal's own "folder" field should stay at its default
    // ("All mailboxes"), not the simple bar's current-folder scope.
    expect(
      screen.getByRole('button', { name: 'search.folders_all.string' })
    ).toHaveClass('bg-primary')
  })
})
