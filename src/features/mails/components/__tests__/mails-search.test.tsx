import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { clearMailSearch } from '../../store/mail-search-slice'
import { MailsSearch } from '../mails-search'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockPush = jest.fn()
const mockUseSearchParams = jest.fn(() => new URLSearchParams())
const mockUseParams = jest.fn(() => ({ account: '0', folder: 'INBOX' }))

jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
  useSearchParams: () => mockUseSearchParams(),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => '/en/u/0/INBOX',
  useRouter: () => ({ push: mockPush }),
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
    mockPush.mockClear()
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
    mockUseParams.mockReturnValue({ account: '0', folder: 'INBOX' })
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

    const clearButton = screen.getByRole('button', {
      name: 'search.clear.string',
    })
    await user.click(clearButton)

    expect(mockDispatch).toHaveBeenCalledWith(clearMailSearch())
  })

  it('clears the displayed query when the search is cleared externally (e.g. by a folder change)', () => {
    mockMailSearchState.isActive = true
    mockMailSearchState.accountId = '0'
    mockMailSearchState.params = {
      subject: 'invoice',
      from: 'invoice',
      operator: 'OR',
    }

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

    expect(
      screen.getByRole('checkbox', { name: 'subject.string' })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'search.scope.sender.string' })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'search.to_or_cc.string' })
    ).not.toBeChecked()
  })

  it('does not show the advanced search bar label in simple mode', () => {
    render(<MailsSearch />)

    expect(
      screen.queryByText('search.advanced_bar_label.string')
    ).not.toBeInTheDocument()
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

    await user.click(
      screen.getByRole('button', { name: 'search.advanced.string' })
    )

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

  it('clears the URL page param when a new search is submitted', async () => {
    // A new search's result set has its own page count, unrelated to
    // whatever page the previous view was on.
    mockUseSearchParams.mockReturnValue(new URLSearchParams('page=3'))
    const user = userEvent.setup()
    render(<MailsSearch />)

    const queryInput = screen.getByPlaceholderText('search.placeholder.string')
    await user.type(queryInput, 'invoice{Enter}')

    expect(mockPush).toHaveBeenCalledWith('/en/u/0/INBOX')
  })

  it('leaves the URL alone when submitting a search with no page param', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
    const user = userEvent.setup()
    render(<MailsSearch />)

    const queryInput = screen.getByPlaceholderText('search.placeholder.string')
    await user.type(queryInput, 'invoice{Enter}')

    expect(mockPush).not.toHaveBeenCalled()
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
    await user.click(
      screen.getByRole('checkbox', { name: 'search.to_or_cc.string' })
    )
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

    expect(
      screen.getByRole('checkbox', { name: 'subject.string' })
    ).toBeChecked()
  })

  it('switches to the advanced query bar (hiding the field-scope selector) once a recognized operator is typed, and applies the search on Enter', async () => {
    const user = userEvent.setup()
    render(<MailsSearch />)

    const queryInput = screen.getByPlaceholderText('search.placeholder.string')
    await user.type(queryInput, 'to:jane')

    expect(
      screen.getByPlaceholderText('search.advanced_placeholder.string')
    ).toHaveValue('to:jane')
    expect(
      screen.queryByTestId('field-scope-multiselect')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('search.advanced_bar_label.string')
    ).toBeInTheDocument()

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

    await user.click(
      screen.getByRole('button', { name: 'search.advanced.string' })
    )
    await user.click(
      screen.getByRole('button', { name: 'search.confirm.string' })
    )

    expect(
      screen.queryByRole('button', { name: 'search.confirm.string' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('field-scope-multiselect')
    ).not.toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('search.advanced_placeholder.string')
    ).toBeInTheDocument()
    expect(
      screen.getByText('search.advanced_bar_label.string')
    ).toBeInTheDocument()
  })

  it('shows the advanced query bar, formatted as key:value tokens, for an active search the simple bar cannot represent', () => {
    mockMailSearchState.isActive = true
    mockMailSearchState.accountId = '0'
    mockMailSearchState.params = { subject: 'invoice', bcc: 'jane@example.com' }

    render(<MailsSearch />)

    expect(
      screen.getByPlaceholderText('search.advanced_placeholder.string')
    ).toHaveValue('subject:invoice bcc:jane@example.com')
    expect(
      screen.queryByTestId('field-scope-multiselect')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('search.advanced_bar_label.string')
    ).toBeInTheDocument()
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
    await user.click(
      screen.getByRole('button', { name: 'search.advanced.string' })
    )

    // The advanced modal's own "folder" field should stay at its default
    // (inbox), not the simple bar's current-folder scope.
    expect(
      screen.getByRole('button', { name: 'search.folders_all.string' })
    ).not.toHaveClass('bg-primary')
  })

  describe('advanced search route', () => {
    it('navigates to the /advanced-search route, dispatching with folder "advanced-search", when confirming the modal', async () => {
      const user = userEvent.setup()
      render(<MailsSearch />)

      await user.click(
        screen.getByRole('button', { name: 'search.advanced.string' })
      )
      await user.click(
        screen.getByRole('button', { name: 'search.confirm.string' })
      )

      // The modal's own fields (SearchMoreOptions) are mocked out above, so
      // this submits the default values — enough to check the URL and
      // dispatch target the advanced-search route; param encoding itself is
      // covered by buildAdvancedSearchPath's own unit tests. The default
      // folder scope is now the inbox, hence the `folder=INBOX` query param.
      expect(mockPush).toHaveBeenCalledWith('/u/0/advanced-search?folder=INBOX')
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            accountId: '0',
            folder: 'advanced-search',
          }),
        })
      )
    })

    it('returns to the inbox when clearing a search from the advanced-search route', async () => {
      mockUseParams.mockReturnValue({ account: '0', folder: 'advanced-search' })
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { from: 'jane' }
      const user = userEvent.setup()
      render(<MailsSearch />)

      const clearButton = screen.getByRole('button', {
        name: 'search.clear.string',
      })
      await user.click(clearButton)

      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
    })

    it('does not navigate when clearing a search from a regular folder', async () => {
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = { text: 'invoice' }
      const user = userEvent.setup()
      render(<MailsSearch />)

      const clearButton = screen.getByRole('button', {
        name: 'search.clear.string',
      })
      await user.click(clearButton)

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('regression: editing a simple-bar-compatible search from a fresh mount on /advanced-search keeps the real folder scope', async () => {
      // A single-criterion advanced search with operator OR is judged
      // "simple-bar compatible" (isSimpleBarCompatible never looks at
      // folders), so reloading/opening /advanced-search?... for one shows
      // the simple bar prefilled, while currentFolderPath is the pseudo
      // segment 'advanced-search' — that pseudo segment must never be sent
      // as the folder to search.
      mockUseParams.mockReturnValue({ account: '0', folder: 'advanced-search' })
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = {
        subject: 'invoice',
        operator: 'OR',
        folders: ['all'],
      }
      const user = userEvent.setup()
      render(<MailsSearch />)

      const queryInput = screen.getByPlaceholderText(
        'search.placeholder.string'
      )
      expect(queryInput).toHaveValue('invoice')
      await user.type(queryInput, ' urgent{Enter}')

      const [{ payload }] = mockDispatch.mock.calls.at(-1)!
      expect(payload.params.folders).toEqual(['all'])
      expect(mockPush).toHaveBeenCalledWith(
        '/u/0/advanced-search?subject=invoice+urgent&operator=OR'
      )
    })

    it('regression: preserves a specific real folder scope (not "all") when editing from a fresh mount on /advanced-search', async () => {
      mockUseParams.mockReturnValue({ account: '0', folder: 'advanced-search' })
      mockMailSearchState.isActive = true
      mockMailSearchState.accountId = '0'
      mockMailSearchState.params = {
        subject: 'invoice',
        operator: 'OR',
        folders: ['INBOX/Work'],
      }
      const user = userEvent.setup()
      render(<MailsSearch />)

      const queryInput = screen.getByPlaceholderText(
        'search.placeholder.string'
      )
      await user.type(queryInput, '{Enter}')

      const [{ payload }] = mockDispatch.mock.calls.at(-1)!
      expect(payload.params.folders).toEqual(['INBOX/Work'])
    })

    it('does not push an advanced-search URL when editing the simple bar on a regular folder', async () => {
      const user = userEvent.setup()
      render(<MailsSearch />)

      const queryInput = screen.getByPlaceholderText(
        'search.placeholder.string'
      )
      await user.type(queryInput, 'invoice{Enter}')

      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining('advanced-search')
      )
    })
  })
})
