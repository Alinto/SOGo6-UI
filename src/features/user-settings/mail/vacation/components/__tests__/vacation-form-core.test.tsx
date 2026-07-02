import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { createEmptyVacation } from '../../mail-vacation-utils'
import MailVacationSettingsForm from '../vacation-form-core'

type Props = React.ComponentProps<typeof MailVacationSettingsForm>

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/user-settings/components/settings-form-action-bar', () => ({
  __esModule: true,
  default: ({
    visible,
    submitLabel,
  }: {
    visible: boolean
    submitLabel: string
  }) =>
    visible ? (
      <div data-testid="action-bar">
        <button type="submit">{submitLabel}</button>
      </div>
    ) : null,
}))

jest.mock('@/components/ui/dates/date-range-picker-form', () => ({
  DatePickerWithRangeForm: ({ name }: { name: string }) => (
    <div data-testid={`date-picker-${name}`} />
  ),
}))

jest.mock('../vacation-time-range-field', () => ({
  __esModule: true,
  default: () => <div data-testid="time-range-field" />,
}))

jest.mock('../vacation-weekday-toggle', () => ({
  __esModule: true,
  default: () => <div data-testid="weekday-toggle" />,
}))

describe('MailVacationSettingsForm (core)', () => {
  const mockT = jest.fn((key: string) => key)
  const mockUpdate = jest.fn(() => ({
    unwrap: jest.fn().mockResolvedValue(createEmptyVacation()),
  })) as unknown as Props['update']

  const defaultProps: Props = {
    data: createEmptyVacation(),
    accountId: '0',
    timezone: 'Europe/Paris',
    vacationAllowResponseAlways: false,
    update: mockUpdate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockImplementation((ns: string) => {
      if (ns === 'US_MAIL_VACATIONS') return mockT
      return (key: string) => key
    })
  })

  it('renders enable checkbox', () => {
    render(<MailVacationSettingsForm {...defaultProps} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('does not render vacation fields when disabled', () => {
    render(<MailVacationSettingsForm {...defaultProps} />)
    expect(
      screen.queryByPlaceholderText('auto_reply.message.string')
    ).not.toBeInTheDocument()
  })

  it('renders alwaysSend only when vacationAllowResponseAlways is true', () => {
    const enabledData = {
      ...createEmptyVacation(),
      enabled: true,
      autoReplyText: 'Away',
    }

    const { rerender } = render(
      <MailVacationSettingsForm
        {...defaultProps}
        data={enabledData}
        vacationAllowResponseAlways={false}
      />
    )

    expect(
      screen.queryByText('auto_reply.response.send_always.label.string')
    ).not.toBeInTheDocument()

    rerender(
      <MailVacationSettingsForm
        {...defaultProps}
        data={enabledData}
        vacationAllowResponseAlways={true}
      />
    )

    expect(
      screen.getByText('auto_reply.response.send_always.label.string')
    ).toBeInTheDocument()
  })
})
