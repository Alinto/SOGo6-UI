import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import ListLabelFilter from '../list-label-filter'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockPush = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => '/u/0/INBOX',
  useRouter: () => ({ push: mockPush }),
}))

let mockSearchParams = new URLSearchParams()
jest.mock('next/navigation', () => ({
  useParams: () => ({ account: '0', folder: 'INBOX' }),
  useSearchParams: () => mockSearchParams,
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (fn: (s: any) => unknown) =>
    fn({ mailSearch: { isActive: false, accountId: null, params: null } }),
}))

const mockUseMailLabelOptions = jest.fn()
jest.mock('@/features/mails/hooks/use-mail-label-options', () => ({
  useMailLabelOptions: (...args: unknown[]) => mockUseMailLabelOptions(...args),
}))

const LABELS = [
  { name: 'Work', color: '#8b5cf6', is_default: true },
  { name: 'toto', color: '#22c55e', is_default: false },
  { name: 'tutu', color: null, is_default: false },
]

const open = () =>
  fireEvent.click(
    screen.getByRole('button', { name: 'filter.labels.label.string' })
  )

const pushedQuery = () =>
  new URLSearchParams(mockPush.mock.calls[0][0].split('?')[1] ?? '')

describe('ListLabelFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    mockUseMailLabelOptions.mockReturnValue({
      labels: LABELS,
      isFetching: false,
    })
  })

  it('loads the labels of the account only once opened', () => {
    render(<ListLabelFilter />)
    expect(mockUseMailLabelOptions).toHaveBeenLastCalledWith('0', false)
    open()
    expect(mockUseMailLabelOptions).toHaveBeenLastCalledWith('0', true)
  })

  it('lists the labels with their color, default ones translated', () => {
    render(<ListLabelFilter />)
    open()
    expect(screen.getByText('labels.Work')).toBeInTheDocument()
    expect(screen.getByText('toto')).toBeInTheDocument()
    const dot = (text: string) =>
      screen.getByText(text).previousElementSibling as HTMLElement
    expect(dot('toto')).toHaveStyle({ backgroundColor: '#22c55e' })
    expect(dot('tutu').getAttribute('style')).toContain('hsl(var(--primary))')
  })

  it('adds a label to the URL, keeping the status filter and resetting the page', () => {
    mockSearchParams = new URLSearchParams('filter=unread&page=3&label=Work')
    render(<ListLabelFilter />)
    open()
    fireEvent.click(screen.getByText('toto'))

    const query = pushedQuery()
    expect(query.getAll('label')).toEqual(['Work', 'toto'])
    expect(query.get('filter')).toBe('unread')
    expect(query.has('page')).toBe(false)
  })

  it('removes an unchecked label', () => {
    mockSearchParams = new URLSearchParams('label=Work&label=toto')
    render(<ListLabelFilter />)
    open()
    fireEvent.click(screen.getByText('labels.Work'))
    expect(pushedQuery().getAll('label')).toEqual(['toto'])
  })

  it('shows the active label count and clears every label', () => {
    mockSearchParams = new URLSearchParams('label=Work&label=toto&filter=read')
    render(<ListLabelFilter compact />)
    expect(screen.getByTestId('list-label-filter-count')).toHaveTextContent('2')
    open()
    fireEvent.click(screen.getByText('filter.labels.clear.string'))
    expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?filter=read')
  })

  it('checks an option whatever the case of the URL label', () => {
    mockSearchParams = new URLSearchParams('label=work')
    render(<ListLabelFilter />)
    open()
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked()

    fireEvent.click(screen.getByText('labels.Work'))
    expect(pushedQuery().getAll('label')).toEqual([])
  })

  it('lists an active label matching no option, so it can be unchecked', () => {
    mockSearchParams = new URLSearchParams('label=Work&label=Projet-X')
    render(<ListLabelFilter />)
    open()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(LABELS.length + 1)
    expect(checkboxes[LABELS.length]).toBeChecked()

    fireEvent.click(screen.getByText('Projet-X'))
    expect(pushedQuery().getAll('label')).toEqual(['Work'])
  })

  it('has no count nor clear button without active label', () => {
    render(<ListLabelFilter />)
    expect(screen.queryByTestId('list-label-filter-count')).toBeNull()
    open()
    expect(screen.queryByText('filter.labels.clear.string')).toBeNull()
  })
})
