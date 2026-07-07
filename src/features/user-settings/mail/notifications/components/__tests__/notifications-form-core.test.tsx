import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { createEmptyNotification } from '../../mail-notifications-utils'
import MailNotificationsSettingForm from '../notifications-form-core'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/user-settings/components/settings-form-action-bar', () => ({
  __esModule: true,
  default: ({
    disableSubmit,
    submitLabel,
  }: {
    disableSubmit: boolean
    submitLabel: string
  }) => (
    <div data-testid="action-bar">
      <button type="submit" disabled={disableSubmit}>
        {submitLabel}
      </button>
    </div>
  ),
}))

jest.mock('@/features/user-settings/components/tagged-email-input', () => ({
  __esModule: true,
  default: () => <div data-testid="notifications-email-input" />,
}))

describe('MailNotificationsSettingForm (core)', () => {
  const mockT = jest.fn((key: string) => key)
  const mockUpdate = jest.fn(() => ({
    unwrap: jest.fn().mockResolvedValue(createEmptyNotification()),
  })) as unknown as Props['update']

  const defaultProps: Props = {
    data: createEmptyNotification(),
    accountId: 'acc-1',
    update: mockUpdate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockImplementation((ns: string) => {
      if (ns === 'US_MAIL_NOTIFICATIONS') return mockT
      return (key: string) => key
    })
  })

  it('renders email input area', () => {
    render(<MailNotificationsSettingForm {...defaultProps} />)
    expect(screen.getByTestId('notifications-email-input')).toBeInTheDocument()
  })

  it('renders save action bar', () => {
    render(<MailNotificationsSettingForm {...defaultProps} />)
    expect(screen.getByTestId('action-bar')).toBeInTheDocument()
  })
})

type Props = React.ComponentProps<typeof MailNotificationsSettingForm>
