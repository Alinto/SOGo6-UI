import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useProfile } from '@/features/user-profile'
import MailVacationSettings from '../index'
import {
  useGetMailVacationSettingsQuery,
  useUpdateMailVacationSettingsMutation,
} from '../store/mail-vacation-settings-api'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('../store/mail-vacation-settings-api', () => ({
  useGetMailVacationSettingsQuery: jest.fn(),
  useUpdateMailVacationSettingsMutation: jest.fn(),
}))

jest.mock('../components/vacation-form', () => ({
  __esModule: true,
  default: ({
    accountId,
    vacationAllowResponseAlways,
  }: {
    accountId: string
    vacationAllowResponseAlways: boolean
  }) => (
    <div
      data-testid="vacation-form"
      data-account-id={accountId}
      data-allow-always={String(vacationAllowResponseAlways)}
    />
  ),
}))

jest.mock('../components/vacation-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="vacation-skeleton" />,
}))

describe('MailVacationSettings', () => {
  const mockTranslate = jest.fn((key: string) => key)
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
    ;(useProfile as jest.Mock).mockReturnValue({
      mainAccount: { id: 'acc-1' },
      timezone: 'Europe/Paris',
      vacationAllowResponseAlways: false,
    })
    ;(useUpdateMailVacationSettingsMutation as jest.Mock).mockReturnValue([
      mockUpdate,
    ])
  })

  it('renders page title and description', () => {
    ;(useGetMailVacationSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    })

    render(<MailVacationSettings />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('page.description.string')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    ;(useGetMailVacationSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(<MailVacationSettings />)

    expect(screen.getByTestId('vacation-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('vacation-form')).not.toBeInTheDocument()
  })

  it('renders vacation form when data is loaded', () => {
    ;(useGetMailVacationSettingsQuery as jest.Mock).mockReturnValue({
      data: { enabled: false },
      error: undefined,
      isLoading: false,
    })

    render(<MailVacationSettings />)

    expect(screen.getByTestId('vacation-form')).toBeInTheDocument()
    expect(screen.getByTestId('vacation-form')).toHaveAttribute(
      'data-account-id',
      'acc-1'
    )
  })

  it('shows feature disabled message on 403 error', () => {
    ;(useGetMailVacationSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 403 },
      isLoading: false,
    })

    render(<MailVacationSettings />)

    expect(
      screen.getByText('errors_api.feature_disabled.string')
    ).toBeInTheDocument()
  })

  it('shows generic load error for other failures', () => {
    ;(useGetMailVacationSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 500 },
      isLoading: false,
    })

    render(<MailVacationSettings />)

    expect(screen.getByText('errors_api.load_failed.string')).toBeInTheDocument()
  })

  it('passes vacationAllowResponseAlways to form', () => {
    ;(useProfile as jest.Mock).mockReturnValue({
      mainAccount: { id: 'acc-1' },
      timezone: 'Europe/Paris',
      vacationAllowResponseAlways: true,
    })
    ;(useGetMailVacationSettingsQuery as jest.Mock).mockReturnValue({
      data: { enabled: false },
      error: undefined,
      isLoading: false,
    })

    render(<MailVacationSettings />)

    expect(screen.getByTestId('vacation-form')).toHaveAttribute(
      'data-allow-always',
      'true'
    )
  })
})
