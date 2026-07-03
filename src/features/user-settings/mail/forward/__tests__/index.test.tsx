import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useProfile } from '@/features/user-profile'
import MailForwardSettings from '../index'
import {
  useGetMailForwardSettingsQuery,
  useUpdateMailForwardSettingsMutation,
} from '../store/mail-forward-settings-api'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('../store/mail-forward-settings-api', () => ({
  useGetMailForwardSettingsQuery: jest.fn(),
  useUpdateMailForwardSettingsMutation: jest.fn(),
}))

jest.mock('../components/forward-form', () => ({
  __esModule: true,
  default: ({ accountId }: { accountId: string }) => (
    <div data-testid="forward-form" data-account-id={accountId} />
  ),
}))

jest.mock('../components/forward-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="forward-skeleton" />,
}))

describe('MailForwardSettings', () => {
  const mockTranslate = jest.fn((key: string) => key)
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
    ;(useProfile as jest.Mock).mockReturnValue({
      mainAccount: { id: 'acc-1' },
    })
    ;(useUpdateMailForwardSettingsMutation as jest.Mock).mockReturnValue([
      mockUpdate,
    ])
  })

  it('renders page title and description', () => {
    ;(useGetMailForwardSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    })

    render(<MailForwardSettings />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('page.description.string')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    ;(useGetMailForwardSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(<MailForwardSettings />)

    expect(screen.getByTestId('forward-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('forward-form')).not.toBeInTheDocument()
  })

  it('renders forward form when data is loaded', () => {
    ;(useGetMailForwardSettingsQuery as jest.Mock).mockReturnValue({
      data: { enabled: false, addresses: [] },
      error: undefined,
      isLoading: false,
    })

    render(<MailForwardSettings />)

    expect(screen.getByTestId('forward-form')).toBeInTheDocument()
    expect(screen.getByTestId('forward-form')).toHaveAttribute(
      'data-account-id',
      'acc-1'
    )
  })

  it('shows feature disabled message on 403 error', () => {
    ;(useGetMailForwardSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 403 },
      isLoading: false,
    })

    render(<MailForwardSettings />)

    expect(
      screen.getByText('errors_api.feature_disabled.string')
    ).toBeInTheDocument()
  })

  it('shows generic load error for other failures', () => {
    ;(useGetMailForwardSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 500 },
      isLoading: false,
    })

    render(<MailForwardSettings />)

    expect(screen.getByText('errors_api.load_failed.string')).toBeInTheDocument()
  })
})
