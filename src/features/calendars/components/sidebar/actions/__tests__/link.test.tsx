import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockEnable = jest.fn()
const mockRevoke = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useEnableCalendarSubscriptionMutation: () => [
    mockEnable,
    { isLoading: false },
  ],
  useRevokeCalendarSubscriptionMutation: () => [
    mockRevoke,
    { isLoading: false },
  ],
}))

import LinkAction from '../link'

describe('LinkAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEnable.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          public_url: 'https://example.test/public/cal',
          share_token: 'token',
        }),
    })
    mockRevoke.mockReturnValue({ unwrap: () => Promise.resolve(undefined) })
  })

  it('does not publish a link when the dialog opens', () => {
    render(<LinkAction calendarKey="cal-1" />)
    expect(mockEnable).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'sidebar.link.enable.string' })
    ).toBeInTheDocument()
  })

  it('publishes the link only after the enable click', async () => {
    const user = userEvent.setup()
    render(<LinkAction calendarKey="cal-1" />)
    await user.click(
      screen.getByRole('button', { name: 'sidebar.link.enable.string' })
    )
    await waitFor(() =>
      expect(mockEnable).toHaveBeenCalledWith({ calendarKey: 'cal-1' })
    )
    expect(
      screen.getByDisplayValue('https://example.test/public/cal')
    ).toBeInTheDocument()
  })

  it('shows an existing public url and revokes it', async () => {
    const user = userEvent.setup()
    render(
      <LinkAction
        calendarKey="cal-1"
        publicUrl="https://example.test/already"
      />
    )
    expect(mockEnable).not.toHaveBeenCalled()
    expect(
      screen.getByDisplayValue('https://example.test/already')
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'sidebar.link.revoke.string' })
    )
    await waitFor(() =>
      expect(mockRevoke).toHaveBeenCalledWith({ calendarKey: 'cal-1' })
    )
    expect(
      screen.getByRole('button', { name: 'sidebar.link.enable.string' })
    ).toBeInTheDocument()
  })
})
