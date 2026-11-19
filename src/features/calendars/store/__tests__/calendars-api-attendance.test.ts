import { configureStore, type Middleware } from '@reduxjs/toolkit'
import { waitFor } from '@testing-library/react'

const mockBaseQuery = jest.fn()

// Replace the real apiSlice (env lookup, auth, semaphore) with one backed by a mocked base query.
jest.mock('@/lib/redux/api/api-slice', () => {
  const actual = jest.requireActual('@/lib/redux/api/api-slice')
  const { createApi } = jest.requireActual('@reduxjs/toolkit/query/react')
  return {
    ...actual,
    apiSlice: createApi({
      reducerPath: 'api',
      tagTypes: [actual.CALENDARS_SLICE, actual.CALENDAR_EVENTS_SLICE],
      baseQuery: (...args: unknown[]) => mockBaseQuery(...args),
      endpoints: () => ({}),
    }),
  }
})

import { apiSlice } from '@/lib/redux/api/api-slice'

import '../calendars-api'

type Initiate = (arg: unknown) => {
  unwrap: () => Promise<unknown>
  unsubscribe?: () => void
}

const endpoints = apiSlice.endpoints as unknown as Record<
  string,
  { initiate: Initiate }
>

type Notification = { type: string; title: string; message: string }

function setupStore() {
  const notifications: Notification[] = []
  const captureNotifications: Middleware = () => (next) => (action) => {
    const typed = action as { type?: string; payload?: Notification }
    if (typed.type?.endsWith('addNotification') && typed.payload) {
      notifications.push(typed.payload)
    }
    return next(action)
  }
  const store = configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false })
        .concat(apiSlice.middleware)
        .concat(captureNotifications),
  })
  return { store, notifications }
}

const attendanceCalls = () =>
  mockBaseQuery.mock.calls
    .map(([args]) => args as { url?: string; body?: unknown })
    .filter((args) => args?.url?.endsWith('/attendance'))

// getCalendarEventById passes the bare path string as its query arg.
const eventCalls = (eventKey: string) =>
  mockBaseQuery.mock.calls.filter(([args]) => args === `events/${eventKey}`)
    .length

describe('postEventAttendance', () => {
  beforeEach(() => {
    mockBaseQuery.mockReset()
  })

  it('sends the sequence the server requires', async () => {
    mockBaseQuery.mockResolvedValue({ data: { data: { key: 'e1' } } })
    const { store } = setupStore()

    await store.dispatch(
      endpoints.postEventAttendance.initiate({
        eventKey: 'e1',
        status: 'accepted',
        sequence: 3,
      }) as never
    )

    expect(attendanceCalls()).toEqual([
      expect.objectContaining({
        method: 'POST',
        body: { status: 'accepted', sequence: 3 },
      }),
    ])
  })

  it('keeps the recurrence id next to the sequence', async () => {
    mockBaseQuery.mockResolvedValue({ data: { data: { key: 'e1' } } })
    const { store } = setupStore()

    await store.dispatch(
      endpoints.postEventAttendance.initiate({
        eventKey: 'e1',
        status: 'declined',
        sequence: 0,
        recurrence_id: '2026-11-20T09:00:00Z',
      }) as never
    )

    expect(attendanceCalls()[0]?.body).toEqual({
      status: 'declined',
      sequence: 0,
      recurrence_id: '2026-11-20T09:00:00Z',
    })
  })

  it('reloads the event and explains why when it was revised since it was read', async () => {
    mockBaseQuery.mockImplementation(async (args: unknown) => {
      if ((args as { url?: string })?.url?.endsWith('/attendance')) {
        return {
          error: {
            status: 409,
            data: { error_code: 'S000629', error_msg: 'Revised' },
          },
        }
      }
      return { data: { data: { key: 'e1', sequence: 4 } } }
    })
    const { store, notifications } = setupStore()
    store.dispatch(
      endpoints.getCalendarEventById.initiate({ eventKey: 'e1' }) as never
    )
    await waitFor(() => expect(eventCalls('e1')).toBe(1))

    await store.dispatch(
      endpoints.postEventAttendance.initiate({
        eventKey: 'e1',
        status: 'accepted',
        sequence: 3,
      }) as never
    )

    await waitFor(() => expect(eventCalls('e1')).toBe(2))
    expect(notifications).toEqual([
      expect.objectContaining({
        title: 'calendar_event_attendance.obsolete.title.string',
        message: 'calendar_event_attendance.obsolete.message.string',
      }),
    ])
  })

  it('keeps the generic error for any other failure', async () => {
    mockBaseQuery.mockResolvedValue({
      error: { status: 500, data: { error_code: 'S000001' } },
    })
    const { store, notifications } = setupStore()

    await store.dispatch(
      endpoints.postEventAttendance.initiate({
        eventKey: 'e1',
        status: 'tentative',
        sequence: 1,
      }) as never
    )

    expect(notifications).toEqual([
      expect.objectContaining({
        type: 'error',
        title: 'calendar_event_attendance.error.title.string',
      }),
    ])
  })
})
