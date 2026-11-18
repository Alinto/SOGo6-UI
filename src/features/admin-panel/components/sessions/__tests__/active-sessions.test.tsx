import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockRevoke = jest.fn()
const mockRevokeInactive = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/admin-panel/store/admin-panel-api', () => ({
  useGetActiveSessionsQuery: () => ({
    data: [
      {
        uid: 'ada',
        domain: 'example.org',
        last_activity: '1700000000',
        session_key: 'redis-1',
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useRevokeSessionsMutation: () => [mockRevoke, { isLoading: false }],
  useRevokeInactiveSessionsMutation: () => [
    mockRevokeInactive,
    { isLoading: false },
  ],
}))

import { ActiveSessions } from '../active-sessions'

describe('ActiveSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRevoke.mockReturnValue({ unwrap: () => Promise.resolve() })
    mockRevokeInactive.mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  it('revokes one session by its redis key', async () => {
    const user = userEvent.setup()
    render(<ActiveSessions />)
    expect(screen.getByText('ada')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'revoke.string' }))
    await waitFor(() =>
      expect(mockRevoke).toHaveBeenCalledWith({ redis_key: ['redis-1'] })
    )
  })

  it('revokes inactive sessions from the chosen timestamp', async () => {
    const user = userEvent.setup()
    render(<ActiveSessions />)
    await user.type(
      screen.getByLabelText('inactive.label.string'),
      '2026-11-18T10:00'
    )
    await user.click(
      screen.getByRole('button', { name: 'inactive.submit.string' })
    )
    await waitFor(() => expect(mockRevokeInactive).toHaveBeenCalled())
    const timestamp = mockRevokeInactive.mock.calls[0][0].timestamp
    expect(timestamp).toBe(
      Math.floor(new Date('2026-11-18T10:00').getTime() / 1000)
    )
  })
})
