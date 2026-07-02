import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { Suspense } from 'react'
import { createEmptyVacation } from '../../mail-vacation-utils'
import MailVacationSettingsForm from '../vacation-form'

jest.mock('../vacation-form-core', () => ({
  __esModule: true,
  default: () => <div data-testid="vacation-form-core" />,
}))

describe('MailVacationSettingsForm (lazy wrapper)', () => {
  const mockUpdate = jest.fn()

  it('renders lazy form core', async () => {
    render(
      <Suspense fallback={<div data-testid="form-loader" />}>
        <MailVacationSettingsForm
          data={createEmptyVacation()}
          accountId="0"
          vacationAllowResponseAlways={false}
          update={mockUpdate}
        />
      </Suspense>
    )

    await waitFor(() => {
      expect(screen.getByTestId('vacation-form-core')).toBeInTheDocument()
    })
  })
})
