import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type React from 'react'
import MailForwardSettingsForm from '../forward-form-core'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock(
  '@/features/user-settings/components/settings-form-action-bar',
  () => ({
    __esModule: true,
    default: () => null,
  })
)

jest.mock('@/components/ui/tag', () => ({
  __esModule: true,
  default: ({
    value,
    action,
    'data-testid': testId,
  }: {
    value: string
    action: () => void
    'data-testid'?: string
  }) => (
    <div data-testid={testId}>
      <span>{value}</span>
      <button type="button" onClick={action}>
        Remove
      </button>
    </div>
  ),
}))

describe('MailForwardSettingsForm (adding emails)', () => {
  const defaultProps: Props = {
    data: {
      enabled: true,
      addresses: ['first@example.com'],
      alwaysSend: false,
      keepCopy: false,
    },
    accountId: '0',
    update: jest.fn() as unknown as Props['update'],
  }

  it('adds the typed email as a tag on Enter', async () => {
    const user = userEvent.setup()
    render(<MailForwardSettingsForm {...defaultProps} />)

    const input = screen.getByTestId('email-input-field')
    await user.type(input, 'new@example.com{Enter}')

    await waitFor(() =>
      expect(screen.getByTestId('email-tag-1')).toHaveTextContent(
        'new@example.com'
      )
    )
    expect(input).toHaveValue('')
  })

  it('adds an email after the last one was removed', async () => {
    const user = userEvent.setup()
    render(<MailForwardSettingsForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    await waitFor(() =>
      expect(screen.queryByTestId('email-tag-0')).not.toBeInTheDocument()
    )

    const input = screen.getByTestId('email-input-field')
    await user.type(input, 'again@example.com{Enter}')

    await waitFor(() =>
      expect(screen.getByTestId('email-tag-0')).toHaveTextContent(
        'again@example.com'
      )
    )
    expect(input).toHaveValue('')
  })

  it('does not exceed the address limit when pasting many emails', async () => {
    const user = userEvent.setup()
    render(<MailForwardSettingsForm {...defaultProps} />)

    const input = screen.getByTestId('email-input-field')
    await user.click(input)
    await user.paste(
      Array.from({ length: 12 }, (_, i) => `p${i}@example.com`).join(', ')
    )

    await waitFor(() =>
      expect(screen.getAllByTestId(/^email-tag-/)).toHaveLength(10)
    )
    expect(input).toHaveValue(
      'p9@example.com, p10@example.com, p11@example.com'
    )
  })
})

type Props = React.ComponentProps<typeof MailForwardSettingsForm>
