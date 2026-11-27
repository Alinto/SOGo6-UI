import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailSubjectLabels from '../mail-subject-labels'

const mockUseGetUserPreferencesQuery = jest.fn()
const mockMailAction = jest.fn()
const mockPush = jest.fn()
let mockPathname = '/u/0/INBOX/42'
let mockSearchParams = new URLSearchParams()
const mockDispatch = jest.fn()
const inactiveSearch = {
  isActive: false,
  accountId: null,
  params: null,
  folder: null,
}
let mockMailSearch: Record<string, unknown> = inactiveSearch

jest.mock('@/features/user-settings/store/user-preferences-api', () => ({
  useGetUserPreferencesQuery: (...args: unknown[]) =>
    mockUseGetUserPreferencesQuery(...args),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useMailActionMutation: () => [mockMailAction, { isLoading: false }],
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
  usePathname: () => mockPathname,
}))

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useParams: () => ({ account: '0', folder: 'INBOX' }),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (fn: (s: any) => unknown) =>
    fn({ mailSearch: mockMailSearch }),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(
    () => (key: string, values?: { name?: string }) =>
      values?.name ? `${key}:${values.name}` : key
  ),
}))

const mockCategories = [
  { name: 'Important', color: '#ff0000', is_default: false },
  { name: 'Work', color: '#00ff00', is_default: false },
]

const buildPreferences = (categories: typeof mockCategories) => ({
  data: {
    data: {
      USER_MAIL_CATEGORY_SETTINGS: {
        SOGO_U_MAIL_CATEGORIES: categories,
      },
    },
  },
})

const defaultProps = {
  accountId: '0',
  folder: 'INBOX',
  mailId: '42',
}

describe('MailSubjectLabels', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname = '/u/0/INBOX/42'
    mockSearchParams = new URLSearchParams()
    mockMailSearch = inactiveSearch
    mockUseGetUserPreferencesQuery.mockReturnValue(
      buildPreferences(mockCategories)
    )
  })

  it('renders nothing when the mail has no matching flags', () => {
    const { container } = render(
      <MailSubjectLabels {...defaultProps} flags={[]} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when flags do not match any category', () => {
    const { container } = render(
      <MailSubjectLabels {...defaultProps} flags={['\\Seen', '\\Flagged']} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a tag with the matching category color for each flag', () => {
    render(
      <MailSubjectLabels {...defaultProps} flags={['Important', 'Work']} />
    )
    expect(screen.getByText('Important')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('matches flags case-insensitively', () => {
    render(<MailSubjectLabels {...defaultProps} flags={['important']} />)
    expect(screen.getByText('Important')).toBeInTheDocument()
  })

  it('renders the translated name for a default category', () => {
    mockUseGetUserPreferencesQuery.mockReturnValue(
      buildPreferences([
        { name: 'Important', color: '#ff0000', is_default: true },
      ])
    )
    render(<MailSubjectLabels {...defaultProps} flags={['Important']} />)
    expect(screen.getByText('labels.Important')).toBeInTheDocument()
  })

  it('calls mailAction to untag when the remove button is clicked', () => {
    render(<MailSubjectLabels {...defaultProps} flags={['Important']} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'label_dialog.remove_tag.string:Important',
      })
    )
    expect(mockMailAction).toHaveBeenCalledWith({
      accountId: '0',
      folder: 'INBOX',
      mailId: '42',
      action: 'untag',
      data: ['Important'],
    })
  })

  describe('label click', () => {
    const clickLabel = (name = 'Important') =>
      fireEvent.click(
        screen.getByRole('button', {
          name: `label_dialog.search_by_tag.string:${name}`,
        })
      )

    it('goes back to the list with the label selected in the quick filter', () => {
      render(<MailSubjectLabels {...defaultProps} flags={['Important']} />)
      clickLabel()
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?label=Important')
    })

    it('keeps the mail open when the list is shown next to it', () => {
      render(
        <MailSubjectLabels
          {...defaultProps}
          flags={['Important']}
          listVisible
        />
      )
      clickLabel()
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX/42?label=Important')
    })

    it('adds the label to the chosen quick filters, back to page 1', () => {
      mockSearchParams = new URLSearchParams(
        'filter=unread&label=Work&page=3&sort=t_asc'
      )
      render(<MailSubjectLabels {...defaultProps} flags={['Important']} />)
      clickLabel()
      expect(mockPush).toHaveBeenCalledWith(
        '/u/0/INBOX?filter=unread&sort=t_asc&label=Work&label=Important'
      )
    })

    it('does not add a label already selected, whatever its case', () => {
      mockSearchParams = new URLSearchParams('label=important')
      render(<MailSubjectLabels {...defaultProps} flags={['Important']} />)
      clickLabel()
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?label=important')
    })

    it('goes back to the advanced search the mail was opened from', () => {
      mockPathname = '/u/0/advanced-search/42'
      mockSearchParams = new URLSearchParams('subject=invoice')
      render(<MailSubjectLabels {...defaultProps} flags={['Important']} />)
      clickLabel()
      expect(mockPush).toHaveBeenCalledWith(
        '/u/0/advanced-search?subject=invoice&label=Important'
      )
    })

    it('turns a match:any search into a match:all one keeping its labels', () => {
      mockMailSearch = {
        isActive: true,
        accountId: '0',
        params: { subject: 'x', labels: ['Work'], operator: 'OR' },
        folder: 'INBOX',
      }
      render(<MailSubjectLabels {...defaultProps} flags={['Important']} />)
      clickLabel()
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            params: { subject: 'x', labels: ['Work'] },
          }),
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?label=Important')
    })

    it('stays on a page that is not the mail route', () => {
      mockPathname = '/u/0/INBOX'
      render(<MailSubjectLabels {...defaultProps} flags={['Important']} />)
      clickLabel()
      expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX?label=Important')
    })
  })
})
