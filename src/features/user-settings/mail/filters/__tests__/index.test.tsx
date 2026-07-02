import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useProfile } from '@/features/user-profile'
import { useGetFoldersQuery } from '@/features/mails/store/mails-api'
import MailFiltersSettings from '../index'
import {
  useGetMailFiltersSettingsQuery,
  useUpdateMailFiltersSettingsMutation,
} from '../store/mail-filters-settings-api'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(),
}))

jest.mock('../store/mail-filters-settings-api', () => ({
  useGetMailFiltersSettingsQuery: jest.fn(),
  useUpdateMailFiltersSettingsMutation: jest.fn(),
}))

jest.mock('../components/filters-form', () => ({
  __esModule: true,
  default: ({ accountId }: { accountId: string }) => (
    <div data-testid="filters-form" data-account-id={accountId} />
  ),
}))

jest.mock('../components/filters-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="filters-skeleton" />,
}))

describe('MailFiltersSettings', () => {
  const mockTranslate = jest.fn((key: string) => key)
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
    ;(useProfile as jest.Mock).mockReturnValue({
      mainAccount: { id: 'acc-1' },
    })
    ;(useUpdateMailFiltersSettingsMutation as jest.Mock).mockReturnValue([
      mockUpdate,
    ])
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    })
  })

  it('renders page title and description', () => {
    ;(useGetMailFiltersSettingsQuery as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<MailFiltersSettings />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('page.description.string')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    ;(useGetMailFiltersSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(<MailFiltersSettings />)

    expect(screen.getByTestId('filters-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('filters-form')).not.toBeInTheDocument()
  })

  it('renders filters form when data is loaded', () => {
    ;(useGetMailFiltersSettingsQuery as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<MailFiltersSettings />)

    expect(screen.getByTestId('filters-form')).toBeInTheDocument()
    expect(screen.getByTestId('filters-form')).toHaveAttribute(
      'data-account-id',
      'acc-1'
    )
  })

  it('shows feature disabled message on 403 error', () => {
    ;(useGetMailFiltersSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 403 },
      isLoading: false,
    })

    render(<MailFiltersSettings />)

    expect(
      screen.getByText('errors_api.feature_disabled.string')
    ).toBeInTheDocument()
  })

  it('shows generic load error for other failures', () => {
    ;(useGetMailFiltersSettingsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: { status: 500 },
      isLoading: false,
    })

    render(<MailFiltersSettings />)

    expect(screen.getByText('errors_api.load_failed.string')).toBeInTheDocument()
  })

  it('prefetches folders for the main account', () => {
    ;(useGetMailFiltersSettingsQuery as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<MailFiltersSettings />)

    expect(useGetFoldersQuery).toHaveBeenCalledWith({ accountId: 'acc-1' })
  })
})
