import { render, screen } from '@testing-library/react'
import { MailboxQuota } from '../mailbox-quota'

// --- Mocks ---

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(
    () => (key: string, values?: Record<string, unknown>) =>
      values ? `${key}:${JSON.stringify(values)}` : key
  ),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ account: '0' })),
}))

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value} />
  ),
}))

jest.mock('@/components/ui/tooltip', () => ({
  TooltipWrapper: ({ children, content }: any) => (
    <div data-testid="tooltip-wrapper" data-content={content}>
      {children}
    </div>
  ),
}))

jest.mock(
  '@/features/user-settings/mail/external-accounts/store/mailboxes-api',
  () => ({
    useGetUserMailboxQuery: jest.fn(),
  })
)

// --- Imports after mocks ---

import { useGetUserMailboxQuery } from '@/features/user-settings/mail/external-accounts/store/mailboxes-api'
import { useParams } from 'next/navigation'

// --- Tests ---

describe('MailboxQuota', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({ account: '0' })
  })

  it('renders nothing while quota data is not available', () => {
    ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({ data: undefined })
    const { container } = render(<MailboxQuota />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when storage_limit is 0', () => {
    ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
      data: {
        quota: { soft_quota_value: 10000, storage_limit: 0, storage_used: 0 },
      },
    })
    const { container } = render(<MailboxQuota />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when soft_quota_value is 0', () => {
    ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
      data: {
        quota: { soft_quota_value: 0, storage_limit: 512000, storage_used: 0 },
      },
    })
    const { container } = render(<MailboxQuota />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the progress bar based on storage_used against the soft-quota-adjusted max', () => {
    // soft_quota_value 10000 = 100.00% -> quota max = storage_limit
    ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
      data: {
        quota: {
          soft_quota_value: 10000,
          storage_limit: 512000,
          storage_used: 126854,
        },
      },
    })
    render(<MailboxQuota />)

    const progress = screen.getByTestId('progress')
    expect(progress).toHaveAttribute(
      'data-value',
      String((126854 / 512000) * 100)
    )
  })

  it('reduces the effective max when soft_quota_value is below 100%', () => {
    // soft_quota_value 5000 = 50.00% -> quota max = storage_limit * 0.5 = 50000
    ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
      data: {
        quota: {
          soft_quota_value: 5000,
          storage_limit: 100000,
          storage_used: 25000,
        },
      },
    })
    render(<MailboxQuota />)

    // 25000 / 50000 * 100 = 50%
    expect(screen.getByTestId('progress')).toHaveAttribute('data-value', '50')
  })

  it('renders the usage text with percent and total in MB', () => {
    ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
      data: {
        quota: {
          soft_quota_value: 10000,
          storage_limit: 512000,
          storage_used: 126854,
        },
      },
    })
    render(<MailboxQuota />)

    // 126854 / 512000 * 100 = 24.776...  -> "24.78"
    // 512000 / 1024 = 500 -> "500"
    expect(
      screen.getByText(/account_switcher\.quota\.string/)
    ).toHaveTextContent('"percent":"24.78"')
    expect(
      screen.getByText(/account_switcher\.quota\.string/)
    ).toHaveTextContent('"total":"500"')
  })

  it('clamps the percentage at 100 when usage exceeds the soft-quota-adjusted max', () => {
    ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
      data: {
        quota: {
          soft_quota_value: 10000,
          storage_limit: 1000,
          storage_used: 5000,
        },
      },
    })
    render(<MailboxQuota />)

    expect(screen.getByTestId('progress')).toHaveAttribute('data-value', '100')
  })

  it('queries the quota for the account from the route params', () => {
    ;(useParams as jest.Mock).mockReturnValue({ account: 'u7lI' })
    ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
      data: {
        quota: {
          soft_quota_value: 8000,
          storage_limit: 100000,
          storage_used: 42000,
        },
      },
    })
    render(<MailboxQuota />)

    expect(useGetUserMailboxQuery).toHaveBeenCalledWith({ id: 'u7lI' })
  })

  it('defaults to account "0" when no account param is present', () => {
    ;(useParams as jest.Mock).mockReturnValue({})
    ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({ data: undefined })
    render(<MailboxQuota />)

    expect(useGetUserMailboxQuery).toHaveBeenCalledWith({ id: '0' })
  })

  describe('Warning icon', () => {
    it('does not show the warning icon when usage is below the threshold', () => {
      // quota max = 100 * 100% = 100, usage 79 -> 79%
      ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
        data: {
          quota: {
            soft_quota_value: 10000,
            storage_limit: 100,
            storage_used: 79,
          },
        },
      })
      render(<MailboxQuota />)

      expect(screen.queryByTestId('tooltip-wrapper')).not.toBeInTheDocument()
    })

    it('shows the warning icon when usage reaches the threshold', () => {
      // quota max = 100 * 100% = 100, usage 80 -> 80%
      ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
        data: {
          quota: {
            soft_quota_value: 10000,
            storage_limit: 100,
            storage_used: 80,
          },
        },
      })
      render(<MailboxQuota />)

      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip-wrapper')).toHaveAttribute(
        'data-content',
        'account_switcher.quota.warning.string'
      )
    })

    it('shows the warning icon when usage exceeds the soft-quota-adjusted max', () => {
      ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
        data: {
          quota: {
            soft_quota_value: 10000,
            storage_limit: 1000,
            storage_used: 5000,
          },
        },
      })
      render(<MailboxQuota />)

      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument()
    })

    it('accounts for a reduced soft quota when checking the warning threshold', () => {
      // quota max = 100000 * 80% = 80000, usage 76000 -> 95%
      ;(useGetUserMailboxQuery as jest.Mock).mockReturnValue({
        data: {
          quota: {
            soft_quota_value: 8000,
            storage_limit: 100000,
            storage_used: 76000,
          },
        },
      })
      render(<MailboxQuota />)

      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument()
    })
  })
})
