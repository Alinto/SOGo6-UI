import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { createEmptyForward } from '../../mail-forward-utils'
import MailForwardSettingsForm from '../forward-form-core'

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

jest.mock('../forward-email-input', () => ({
  __esModule: true,
  default: () => <div data-testid="forward-email-input" />,
}))

describe('MailForwardSettingsForm (core)', () => {
  const mockT = jest.fn((key: string) => key)
  const mockUpdate = jest.fn(() => ({
    unwrap: jest.fn().mockResolvedValue(createEmptyForward()),
  })) as unknown as Props['update']

  const defaultProps: Props = {
    data: createEmptyForward(),
    accountId: '0',
    update: mockUpdate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockImplementation((ns: string) => {
      if (ns === 'US_MAIL_FORWARD') return mockT
      return (key: string) => key
    })
  })

  it('renders email input area', () => {
    render(<MailForwardSettingsForm {...defaultProps} />)
    expect(screen.getByTestId('forward-email-input')).toBeInTheDocument()
  })

  it('does not show action bar when form is pristine', () => {
    render(<MailForwardSettingsForm {...defaultProps} />)
    expect(screen.queryByTestId('action-bar')).not.toBeInTheDocument()
  })
})

type Props = React.ComponentProps<typeof MailForwardSettingsForm>
