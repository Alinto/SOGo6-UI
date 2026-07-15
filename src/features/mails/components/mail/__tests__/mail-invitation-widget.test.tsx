import type { MailInvitationState } from '@/features/mails/hooks/use-mail-invitation'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MailInvitationWidget from '../mail-invitation-widget'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace: string) => (key: string) => {
    if (namespace === 'MAILS_COMMONS.invitation') {
      return key.replace('.string', '')
    }
    return key.replace('.string', '')
  }),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHandleAttendance = jest.fn()
jest.mock('@/features/calendars/hooks/use-event-attendance', () => ({
  RSVP_STATUSES: ['accepted', 'tentative', 'declined'],
  useEventAttendance: jest.fn(() => ({
    currentAttendeeStatus: undefined,
    handleAttendance: mockHandleAttendance,
    isAttendanceLoading: false,
  })),
}))

const baseParsed = {
  method: 'REQUEST' as const,
  uid: 'uid@test.org',
  summary: 'Team sync',
  dtStart: '2026-07-15T10:00:00.000Z',
  dtEnd: '2026-07-15T11:00:00.000Z',
  allDay: false,
}

describe('MailInvitationWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading skeleton', () => {
    const state: MailInvitationState = { kind: 'loading', parsed: baseParsed }
    render(<MailInvitationWidget state={state} />)
    expect(screen.getByTestId('mail-invitation-loading')).toBeInTheDocument()
  })

  it('renders cancel state', () => {
    const state: MailInvitationState = {
      kind: 'cancel',
      parsed: { ...baseParsed, method: 'CANCEL' },
    }
    render(<MailInvitationWidget state={state} />)
    expect(screen.getByText('event_cancelled')).toBeInTheDocument()
    expect(screen.getByText('Team sync')).toBeInTheDocument()
  })

  it('renders invitation with RSVP buttons', () => {
    const state: MailInvitationState = {
      kind: 'invitation',
      parsed: baseParsed,
      eventKey: 'evt-1',
      canRsvp: true,
      event: {
        id: 'evt-1',
        key: 'evt-1',
        calendar_id: 'cal-1',
        title: 'Team sync',
        all_day: false,
        attendees: [{ email: 'bob@example.com', status: 'needs-action' }],
      },
    }
    render(<MailInvitationWidget state={state} />)
    expect(screen.getByText('Team sync')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'attendance.accepted' })
    ).toBeInTheDocument()
  })

  it('calls handleAttendance when RSVP clicked', async () => {
    const user = userEvent.setup()
    const state: MailInvitationState = {
      kind: 'invitation',
      parsed: baseParsed,
      eventKey: 'evt-1',
      canRsvp: true,
      event: {
        id: 'evt-1',
        key: 'evt-1',
        calendar_id: 'cal-1',
        title: 'Team sync',
        all_day: false,
        attendees: [{ email: 'bob@example.com', status: 'needs-action' }],
      },
    }
    render(<MailInvitationWidget state={state} />)
    await user.click(
      screen.getByRole('button', { name: 'attendance.accepted' })
    )
    expect(mockHandleAttendance).toHaveBeenCalledWith('accepted', undefined)
  })
})
