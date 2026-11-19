import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { act, renderHook } from '@testing-library/react'

const mockPostAttendance = jest.fn()

jest.mock('@/features/calendars/store/calendars-api', () => ({
  usePostEventAttendanceMutation: () => [
    mockPostAttendance,
    { isLoading: false },
  ],
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { user: { email: 'me@example.com' } } }),
}))

import { useEventAttendance } from '../use-event-attendance'

const event = (overrides: Partial<CalendarEvent> = {}) =>
  ({
    key: 'evt-1',
    title: 'Review',
    attendees: [{ email: 'me@example.com', status: 'needs-action' }],
    ...overrides,
  }) as unknown as CalendarEvent

describe('useEventAttendance', () => {
  beforeEach(() => {
    mockPostAttendance.mockReset()
    mockPostAttendance.mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  it.each(['accepted', 'declined', 'tentative'] as const)(
    'answers %s with the revision the user was shown',
    async (status) => {
      const { result } = renderHook(() =>
        useEventAttendance(event({ sequence: 2 }))
      )

      await act(() => result.current.handleAttendance(status))

      expect(mockPostAttendance).toHaveBeenCalledWith({
        eventKey: 'evt-1',
        status,
        sequence: 2,
        recurrence_id: undefined,
      })
    }
  )

  it('sends sequence 0 for an event that was never revised', async () => {
    const { result } = renderHook(() => useEventAttendance(event()))

    await act(() => result.current.handleAttendance('accepted'))

    expect(mockPostAttendance).toHaveBeenCalledWith(
      expect.objectContaining({ sequence: 0 })
    )
  })
})
