import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import MailListLabels from '../mail-list-labels'

const mockUseGetUserPreferencesQuery = jest.fn()

jest.mock('@/features/user-settings/store/user-preferences-api', () => ({
  useGetUserPreferencesQuery: (...args: unknown[]) =>
    mockUseGetUserPreferencesQuery(...args),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
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

describe('MailListLabels', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetUserPreferencesQuery.mockReturnValue(
      buildPreferences(mockCategories)
    )
  })

  it('renders nothing when there are no flags', () => {
    const { container } = render(<MailListLabels flags={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when flags do not match any category', () => {
    const { container } = render(
      <MailListLabels flags={['\\Seen', '\\Flagged']} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a chip for each matching flag', () => {
    render(<MailListLabels flags={['Important', 'Work']} />)
    expect(screen.getByText('Important')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('matches flags case-insensitively', () => {
    render(<MailListLabels flags={['important']} />)
    expect(screen.getByText('Important')).toBeInTheDocument()
  })

  it('does not render a remove button', () => {
    render(<MailListLabels flags={['Work']} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the translated name for a default category', () => {
    mockUseGetUserPreferencesQuery.mockReturnValue(
      buildPreferences([
        { name: 'Important', color: '#ff0000', is_default: true },
      ])
    )
    render(<MailListLabels flags={['Important']} />)
    expect(screen.getByText('labels.Important')).toBeInTheDocument()
  })
})
