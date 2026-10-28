import { addNotification } from '@/features/notifications'
import { configureStore, type Middleware } from '@reduxjs/toolkit'

type Args = { url: string; method?: string }

const mockBaseQuery = jest.fn()

// Real endpoints, fake network: only the base query is replaced.
jest.mock('@/lib/redux/api/api-slice', () => {
  const actual = jest.requireActual('@/lib/redux/api/api-slice')
  const { createApi } = jest.requireActual('@reduxjs/toolkit/query/react')
  return {
    ...actual,
    apiSlice: createApi({
      reducerPath: 'api',
      tagTypes: [actual.CALENDAR_EVENTS_SLICE, actual.FOLDER_PREFERENCES_SLICE],
      baseQuery: (args: Args) => mockBaseQuery(args),
      endpoints: () => ({}),
    }),
  }
})

import { apiSlice } from '@/lib/redux/api/api-slice'
import { calendarsApiEndpoints } from '../calendars-api'

const { endpoints } = calendarsApiEndpoints

let dispatchedActions: unknown[] = []
const recordActions: Middleware = () => (next) => (action) => {
  dispatchedActions.push(action)
  return next(action)
}

const makeStore = () =>
  configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefault) =>
      getDefault().concat(apiSlice.middleware, recordActions),
  })

const notifications = () =>
  dispatchedActions.filter(addNotification.match).map((a) => a.payload)

const flush = () => new Promise((resolve) => setTimeout(resolve, 20))

const eventsCalls = () =>
  mockBaseQuery.mock.calls.filter(([args]) => (args as Args).url === 'events')
    .length

describe('folder preferences endpoints', () => {
  let patchFails: boolean

  beforeEach(() => {
    jest.clearAllMocks()
    dispatchedActions = []
    patchFails = false
    mockBaseQuery.mockImplementation(async ({ url, method }: Args) => {
      if (url === 'preferences/folders') {
        if (method === 'PATCH') {
          return patchFails
            ? { error: { status: 500, data: {} } }
            : { data: {} }
        }
        return {
          data: {
            data: { CALENDAR: { OWNER: { cal: { display: false } } } },
            error_code: 'S000000',
          },
        }
      }
      return { data: { data: { events: [], total_count: 0 } } }
    })
  })

  it('unwraps GET /preferences/folders', async () => {
    const store = makeStore()
    const result = await store.dispatch(
      endpoints.getFolderPreferences.initiate()
    )
    expect(result.data).toEqual({
      CALENDAR: { OWNER: { cal: { display: false } } },
    })
  })

  it('refetches events after a successful PATCH', async () => {
    const store = makeStore()
    store.dispatch(
      endpoints.getEvents.initiate({ startDate: 'a', endDate: 'b' })
    )
    await flush()
    expect(eventsCalls()).toBe(1)

    await store.dispatch(
      endpoints.updateFolderPreferences.initiate({
        CALENDAR: { OWNER: { cal: { display: true } } },
      })
    )
    await flush()
    expect(eventsCalls()).toBe(2)
    expect(notifications()).toEqual([])
  })

  it('rolls back and does not refetch events when the PATCH fails', async () => {
    patchFails = true
    const store = makeStore()
    store.dispatch(endpoints.getFolderPreferences.initiate())
    store.dispatch(
      endpoints.getEvents.initiate({ startDate: 'a', endDate: 'b' })
    )
    await flush()

    await store.dispatch(
      endpoints.updateFolderPreferences.initiate({
        CALENDAR: { OWNER: { cal: { display: true } } },
      })
    )
    await flush()

    expect(eventsCalls()).toBe(1)
    const prefs = endpoints.getFolderPreferences.select()(
      store.getState() as never
    )
    expect(prefs.data?.CALENDAR?.OWNER?.cal?.display).toBe(false)
  })

  it('shows an error notification when the PATCH fails', async () => {
    patchFails = true
    const store = makeStore()
    await store.dispatch(
      endpoints.updateFolderPreferences.initiate({
        CALENDAR: { OWNER: { cal: { display: true } } },
      })
    )
    await flush()

    expect(notifications()).toEqual([
      expect.objectContaining({
        type: 'error',
        title: 'calendar_visibility.error.title.string',
        message: 'calendar_visibility.error.message.string',
      }),
    ])
  })

  describe('when a PATCH fails while another one succeeds', () => {
    const runOverlappingPatches = async (initial: object) => {
      let rejectFirst: (error: unknown) => void = () => {}
      mockBaseQuery.mockImplementation(({ url, method }: Args) => {
        if (url !== 'preferences/folders') {
          return { data: { data: { events: [], total_count: 0 } } }
        }
        if (method !== 'PATCH') return { data: { data: initial } }
        // First PATCH: held until rejectFirst; the next ones succeed.
        if (mockBaseQuery.mock.calls.filter(([a]) => a.method).length === 1) {
          return new Promise((_, reject) => {
            rejectFirst = reject
          }).catch(() => ({ error: { status: 500, data: {} } }))
        }
        return { data: {} }
      })

      const store = makeStore()
      store.dispatch(endpoints.getFolderPreferences.initiate())
      await flush()

      const first = store.dispatch(
        endpoints.updateFolderPreferences.initiate({
          CALENDAR: { OWNER: { calA: { display: false } } },
        })
      )
      await store.dispatch(
        endpoints.updateFolderPreferences.initiate({
          CALENDAR: { OWNER: { calB: { display: false } } },
        })
      )
      rejectFirst(new Error('network'))
      await first
      await flush()

      return endpoints.getFolderPreferences.select()(store.getState() as never)
        .data
    }

    it('keeps the other calendar when entries already exist', async () => {
      const prefs = await runOverlappingPatches({
        CALENDAR: { OWNER: { cal: { display: false } } },
      })
      expect(prefs?.CALENDAR?.OWNER).toEqual({
        cal: { display: false },
        calB: { display: false },
      })
    })

    it('keeps the other calendar when the preferences start empty', async () => {
      const prefs = await runOverlappingPatches({})
      expect(prefs?.CALENDAR?.OWNER).toEqual({ calB: { display: false } })
    })
  })
})
