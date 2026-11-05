import { configureStore } from '@reduxjs/toolkit'
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
      tagTypes: [
        actual.CALENDARS_SLICE,
        actual.CALENDAR_EVENTS_SLICE,
        actual.CALENDAR_SHARE_SLICE,
        actual.CALENDAR_SYNC_SLICE,
        actual.SHARED_CALENDARS_SLICE,
      ],
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

function setupStore() {
  return configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(apiSlice.middleware),
  })
}

function countEventsRequests() {
  return mockBaseQuery.mock.calls.filter(
    ([args]) => (args as { url?: string })?.url === 'events'
  ).length
}

const waitForRefetch = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('calendars-api tag invalidation', () => {
  beforeEach(() => {
    mockBaseQuery.mockImplementation(async (args: { url?: string }) => ({
      data: args?.url === 'events' ? { events: [] } : null,
    }))
  })

  it.each([false, true])(
    'refetches events after updating a shared calendar subscription (subscribe=%s)',
    async (subscribe) => {
      const store = setupStore()
      const range = {
        startDate: '2026-11-01T00:00:00.000Z',
        endDate: '2026-11-30T23:59:59.999Z',
      }

      await store.dispatch(endpoints.getEvents.initiate(range) as never)
      expect(countEventsRequests()).toBe(1)

      await (
        store.dispatch(
          endpoints.updateSharedCalendarSubscription.initiate({
            key: 'shared-cal',
            subscribe,
          }) as never
        ) as unknown as ReturnType<Initiate>
      ).unwrap()
      await waitForRefetch()

      expect(countEventsRequests()).toBe(2)
    }
  )

  it("refetches the owners' calendars but not the users after subscribing", async () => {
    const store = setupStore()
    const requestUrl = (args: unknown) =>
      typeof args === 'string' ? args : (args as { url?: string })?.url
    const countRequests = (url: string) =>
      mockBaseQuery.mock.calls.filter(([args]) => requestUrl(args) === url)
        .length

    store.dispatch(
      endpoints.getSharedCalendarUsers.initiate({
        page: 1,
        page_size: 20,
      }) as never
    )
    store.dispatch(
      endpoints.getSharedCalendarsByOwner.initiate('owner@example.org') as never
    )
    await waitForRefetch()
    expect(countRequests('shared-calendars/users')).toBe(1)
    expect(countRequests('shared-calendars/owner%40example.org')).toBe(1)

    await (
      store.dispatch(
        endpoints.updateSharedCalendarSubscription.initiate({
          key: 'shared-cal',
          subscribe: true,
        }) as never
      ) as unknown as ReturnType<Initiate>
    ).unwrap()
    await waitForRefetch()

    expect(countRequests('shared-calendars/users')).toBe(1)
    expect(countRequests('shared-calendars/owner%40example.org')).toBe(2)
  })

  describe('shared calendars dialog cache', () => {
    const OWNER = 'owner@example.org'
    const ownerCalendars = (store: ReturnType<typeof setupStore>) =>
      (
        endpoints.getSharedCalendarsByOwner as unknown as {
          select: (
            arg: string
          ) => (state: unknown) => { data?: { subscribed: boolean }[] }
        }
      ).select(OWNER)(store.getState()).data

    /** The subscription PUT stays pending until `settle` is called. */
    const mockOwnerAndPendingPut = () => {
      let settle: (result: unknown) => void = () => undefined
      mockBaseQuery.mockImplementation((args: unknown) => {
        if (typeof args === 'string') {
          return {
            data: {
              data: {
                calendars: [
                  { key: 'shared-cal', name: 'Team', subscribed: false },
                ],
              },
            },
          }
        }
        if ((args as { method?: string })?.method === 'PUT') {
          return new Promise((resolve) => {
            settle = resolve
          })
        }
        return { data: null }
      })
      return (result: unknown) => settle(result)
    }

    it('shows the subscription right away, before the server answers', async () => {
      const settle = mockOwnerAndPendingPut()
      const store = setupStore()
      await store.dispatch(
        endpoints.getSharedCalendarsByOwner.initiate(OWNER) as never
      )
      expect(ownerCalendars(store)?.[0].subscribed).toBe(false)

      const mutation = store.dispatch(
        endpoints.updateSharedCalendarSubscription.initiate({
          key: 'shared-cal',
          subscribe: true,
        }) as never
      ) as unknown as ReturnType<Initiate>

      expect(ownerCalendars(store)?.[0].subscribed).toBe(true)

      settle({ data: null })
      await mutation.unwrap()
    })

    it('restores the previous state when subscribing fails', async () => {
      const settle = mockOwnerAndPendingPut()
      const store = setupStore()
      await store.dispatch(
        endpoints.getSharedCalendarsByOwner.initiate(OWNER) as never
      )

      const mutation = store.dispatch(
        endpoints.updateSharedCalendarSubscription.initiate({
          key: 'shared-cal',
          subscribe: true,
        }) as never
      ) as unknown as ReturnType<Initiate>
      expect(ownerCalendars(store)?.[0].subscribed).toBe(true)

      settle({ error: { status: 500, data: 'failed' } })
      await expect(mutation.unwrap()).rejects.toBeDefined()

      await waitFor(() =>
        expect(ownerCalendars(store)?.[0].subscribed).toBe(false)
      )
    })

    it('reads the users totals from the X-Pagination header', async () => {
      mockBaseQuery.mockImplementation(() => ({
        data: { data: { users: [{ mail: 'a@x.org', username: 'A' }] } },
        meta: {
          response: {
            headers: {
              get: (name: string) =>
                name === 'X-Pagination'
                  ? '{"total":21,"total_pages":2,"first_page":1,"last_page":2,"page":1}'
                  : null,
            },
          },
        },
      }))
      const store = setupStore()

      const result = await (
        store.dispatch(
          endpoints.getSharedCalendarUsers.initiate({
            page: 1,
            page_size: 20,
          }) as never
        ) as unknown as ReturnType<Initiate>
      ).unwrap()

      expect(result).toEqual({
        users: [{ owner: 'a@x.org', username: 'A' }],
        total_count: 21,
        total_pages: 2,
      })
    })
  })
})
