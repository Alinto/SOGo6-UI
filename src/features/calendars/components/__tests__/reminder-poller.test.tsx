import { configureStore, type Middleware } from '@reduxjs/toolkit'
import { act, render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

const mockBaseQuery = jest.fn()

// Replace the real apiSlice (env lookup, auth, semaphore) with one backed by a mocked base query.
jest.mock('@/lib/redux/api/api-slice', () => {
  const actual = jest.requireActual('@/lib/redux/api/api-slice')
  const { createApi } = jest.requireActual('@reduxjs/toolkit/query/react')
  return {
    ...actual,
    apiSlice: createApi({
      reducerPath: 'api',
      tagTypes: [actual.CALENDAR_REMINDERS_SLICE],
      baseQuery: (...args: unknown[]) => mockBaseQuery(...args),
      endpoints: () => ({}),
    }),
  }
})

import { apiSlice } from '@/lib/redux/api/api-slice'
import ReminderPoller from '../reminder-poller'

type Notification = { title: string; details?: string }

function setup() {
  const notifications: Notification[] = []
  const capture: Middleware = () => (next) => (action) => {
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
        .concat(capture),
  })
  return { store, notifications }
}

// Exact shape returned by GET /reminders (ReminderListResponseSchema).
const serverResponse = {
  data: {
    reminders: [
      {
        event_key: 'evt-1',
        title: 'Standup',
        method: 'popup',
        minutes_before: 15,
        trigger_at: '2026-11-19T09:45:00Z',
      },
    ],
    total_count: 1,
  },
  error_code: '',
  error_msg: '',
}

describe('ReminderPoller', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    mockBaseQuery.mockReset()
    mockBaseQuery.mockResolvedValue({ data: serverResponse })
  })

  it('notifies a popup reminder returned by the server', async () => {
    const { store, notifications } = setup()
    render(
      <Provider store={store}>
        <ReminderPoller />
      </Provider>
    )

    await waitFor(() => expect(notifications).toHaveLength(1))
    expect(notifications[0]).toEqual(
      expect.objectContaining({
        title: 'calendar_reminder.title.string',
        details: 'Standup',
      })
    )
  })

  it('does not notify the same reminder again on the next poll', async () => {
    const { store, notifications } = setup()
    render(
      <Provider store={store}>
        <ReminderPoller />
      </Provider>
    )
    await waitFor(() => expect(notifications).toHaveLength(1))

    await act(async () => {
      await store.dispatch(
        apiSlice.util.invalidateTags(['calendar_reminders']) as never
      )
    })
    await waitFor(() => expect(mockBaseQuery).toHaveBeenCalledTimes(2))

    expect(notifications).toHaveLength(1)
  })
})
