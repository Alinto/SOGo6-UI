import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useProfile } from '@/features/user-profile'
import { useGetFoldersQuery } from '@/features/mails/store/mails-api'
import MailAccessSettings from '../index'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(),
}))

jest.mock('../components/mail-access-list-row', () => ({
  __esModule: true,
  default: ({ folder }: { folder: { path: string; name: string } }) => (
    <div data-testid="mail-access-row">{folder.name}</div>
  ),
}))

jest.mock('../components/mail-access-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-access-skeleton" />,
}))

describe('MailAccessSettings', () => {
  const mockTranslate = jest.fn((key: string) => key)

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
    ;(useProfile as jest.Mock).mockReturnValue({
      mainAccount: { id: '0' },
      folderSharingDisabled: [],
    })
  })

  it('renders page title and description', () => {
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<MailAccessSettings />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('page.description.string')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(<MailAccessSettings />)

    expect(screen.getByTestId('mail-access-skeleton')).toBeInTheDocument()
  })

  it('renders one row per flattened folder', () => {
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: [
        {
          name: 'Inbox',
          path: 'INBOX',
          selectable: true,
          subfolders: [
            { name: 'Work', path: 'INBOX/Work', selectable: true },
          ],
        },
      ],
      error: undefined,
      isLoading: false,
    })

    render(<MailAccessSettings />)

    const rows = screen.getAllByTestId('mail-access-row')
    expect(rows).toHaveLength(2)
    expect(screen.getByText('Inbox')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('shows empty state when there are no folders', () => {
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<MailAccessSettings />)

    expect(screen.getByText('empty.string')).toBeInTheDocument()
  })

  it('shows the disabled message when mail sharing is disabled', () => {
    ;(useProfile as jest.Mock).mockReturnValue({
      mainAccount: { id: '0' },
      folderSharingDisabled: ['mail'],
    })
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: [{ name: 'Inbox', path: 'INBOX', selectable: true }],
      error: undefined,
      isLoading: false,
    })

    render(<MailAccessSettings />)

    expect(screen.getByText('disabled.string')).toBeInTheDocument()
    expect(screen.queryByTestId('mail-access-row')).not.toBeInTheDocument()
  })

  it('shows feature disabled message on 403 error', () => {
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 403 },
      isLoading: false,
    })

    render(<MailAccessSettings />)

    expect(
      screen.getByText('errors_api.feature_disabled.string')
    ).toBeInTheDocument()
  })
})
