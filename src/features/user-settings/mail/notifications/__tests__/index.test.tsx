import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useProfile } from '@/features/user-profile'
import MailNotificationsSettings from '../index'
import {
  useGetMailNotificationSettingsQuery,
  useUpdateMailNotificationSettingsMutation,
} from '../store/mail-notifications-settings-api'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('../store/mail-notifications-settings-api', () => ({
  useGetMailNotificationSettingsQuery: jest.fn(),
  useUpdateMailNotificationSettingsMutation: jest.fn(),
}))

jest.mock('../components/notifications-form', () => ({
  __esModule: true,
  default: ({ accountId }: { accountId: string }) => (
    <div data-testid="notifications-form" data-account-id={accountId} />
  ),
}))

jest.mock('../components/notifications-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="notifications-skeleton" />,
}))

describe('MailNotificationsSettings', () => {
  const mockTranslate = jest.fn((key: string) => key)
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
    ;(useProfile as jest.Mock).mockReturnValue({
      mainAccount: { id: 'acc-1' },
    })
    ;(useUpdateMailNotificationSettingsMutation as jest.Mock).mockReturnValue([
      mockUpdate,
    ])
  })

  it('renders page title and description', () => {
    ;(useGetMailNotificationSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    })

    render(<MailNotificationsSettings />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('page.description.string')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    ;(useGetMailNotificationSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(<MailNotificationsSettings />)

    expect(screen.getByTestId('notifications-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('notifications-form')).not.toBeInTheDocument()
  })

  it('renders notifications form when data is loaded', () => {
    ;(useGetMailNotificationSettingsQuery as jest.Mock).mockReturnValue({
      data: { enabled: false, addresses: [], message: '' },
      error: undefined,
      isLoading: false,
    })

    render(<MailNotificationsSettings />)

    expect(screen.getByTestId('notifications-form')).toBeInTheDocument()
    expect(screen.getByTestId('notifications-form')).toHaveAttribute(
      'data-account-id',
      'acc-1'
    )
  })

  it('shows feature disabled message on 403 error', () => {
    ;(useGetMailNotificationSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 403 },
      isLoading: false,
    })

    render(<MailNotificationsSettings />)

    expect(
      screen.getByText('errors_api.feature_disabled.string')
    ).toBeInTheDocument()
  })

  it('shows generic load error for other failures', () => {
    ;(useGetMailNotificationSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 500 },
      isLoading: false,
    })

    render(<MailNotificationsSettings />)

    expect(screen.getByText('errors_api.load_failed.string')).toBeInTheDocument()
  })
})
