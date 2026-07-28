import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailSubjectLabels from '../mail-subject-labels'

const mockUseGetUserPreferencesQuery = jest.fn()
const mockMailAction = jest.fn()

jest.mock('@/features/user-settings/store/user-preferences-api', () => ({
  useGetUserPreferencesQuery: (...args: unknown[]) =>
    mockUseGetUserPreferencesQuery(...args),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useMailActionMutation: () => [mockMailAction, { isLoading: false }],
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
})
