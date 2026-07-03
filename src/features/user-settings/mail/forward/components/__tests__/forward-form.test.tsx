import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { createEmptyForward } from '../../mail-forward-utils'
import MailForwardSettingsForm from '../forward-form'

jest.mock('../forward-form-core', () => ({
  __esModule: true,
  default: ({
    data,
    accountId,
  }: {
    data: unknown
    accountId: string
  }) => (
    <div
      data-testid="forward-form-core"
      data-account-id={accountId}
      data-has-data={String(!!data)}
    />
  ),
}))

describe('MailForwardSettingsForm (wrapper)', () => {
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form core', () => {
    render(
      <MailForwardSettingsForm
        data={createEmptyForward()}
        accountId="0"
        update={mockUpdate}
      />
    )
    expect(screen.getByTestId('forward-form-core')).toBeInTheDocument()
  })

  it('passes accountId and data to core', () => {
    render(
      <MailForwardSettingsForm
        data={createEmptyForward()}
        accountId="acc-1"
        update={mockUpdate}
      />
    )
    const core = screen.getByTestId('forward-form-core')
    expect(core).toHaveAttribute('data-account-id', 'acc-1')
    expect(core).toHaveAttribute('data-has-data', 'true')
  })

  it('passes undefined data', () => {
    render(
      <MailForwardSettingsForm
        data={undefined}
        accountId="0"
        update={mockUpdate}
      />
    )
    expect(screen.getByTestId('forward-form-core')).toHaveAttribute(
      'data-has-data',
      'false'
    )
  })
})
