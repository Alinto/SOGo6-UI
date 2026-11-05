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
        actual.ADDRESS_BOOKS_SLICE,
        actual.ADDRESS_BOOK_SHARE_SLICE,
        actual.SHARED_ADDRESS_BOOKS_SLICE,
        actual.VCARD_SLICE,
      ],
      baseQuery: (...args: unknown[]) => mockBaseQuery(...args),
      endpoints: () => ({}),
    }),
  }
})

import { apiSlice } from '@/lib/redux/api/api-slice'

import '../address-books-api'

type Initiate = (arg: unknown) => {
  unwrap: () => Promise<unknown>
}

const endpoints = apiSlice.endpoints as unknown as Record<
  string,
  {
    initiate: Initiate
    select: (
      arg: unknown
    ) => (state: unknown) => { data?: { subscribed: boolean }[] }
  }
>

const OWNER = 'owner@example.org'

function setupStore() {
  return configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(apiSlice.middleware),
  })
}

const ownerBooks = (store: ReturnType<typeof setupStore>) =>
  endpoints.getSharedAddressBooksByOwner.select(OWNER)(store.getState()).data

/** The subscription PUT stays pending until `settle` is called. */
const mockOwnerAndPendingPut = () => {
  let settle: (result: unknown) => void = () => undefined
  mockBaseQuery.mockImplementation((args: unknown) => {
    if (typeof args === 'string') {
      return {
        data: {
          data: {
            addressbooks: [
              { key: 'shared-ab', name: 'Team contacts', subscribed: false },
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

const subscribe = (store: ReturnType<typeof setupStore>) =>
  store.dispatch(
    endpoints.updateSharedAddressBookSubscription.initiate({
      key: 'shared-ab',
      subscribe: true,
    }) as never
  ) as unknown as ReturnType<Initiate>

describe('address-books-api shared subscription cache', () => {
  it('shows the subscription right away, before the server answers', async () => {
    const settle = mockOwnerAndPendingPut()
    const store = setupStore()
    await store.dispatch(
      endpoints.getSharedAddressBooksByOwner.initiate(OWNER) as never
    )
    expect(ownerBooks(store)?.[0].subscribed).toBe(false)

    const mutation = subscribe(store)

    expect(ownerBooks(store)?.[0].subscribed).toBe(true)

    settle({ data: null })
    await mutation.unwrap()
  })

  it('restores the previous state when subscribing fails', async () => {
    const settle = mockOwnerAndPendingPut()
    const store = setupStore()
    await store.dispatch(
      endpoints.getSharedAddressBooksByOwner.initiate(OWNER) as never
    )

    const mutation = subscribe(store)
    expect(ownerBooks(store)?.[0].subscribed).toBe(true)

    settle({ error: { status: 500, data: 'failed' } })
    await expect(mutation.unwrap()).rejects.toBeDefined()

    await waitFor(() => expect(ownerBooks(store)?.[0].subscribed).toBe(false))
  })
})
