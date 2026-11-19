const mockStartLogoutWipe = jest.fn((_userId?: string | null) =>
  Promise.resolve()
)

jest.mock('@/features/offline/auth/logout-wipe', () => ({
  startLogoutWipe: (userId?: string | null) => mockStartLogoutWipe(userId),
  waitForLogoutWipe: () => Promise.resolve(),
}))

import {
  logout,
  setCredentials,
} from '@/features/auth/components/store/auth.slice'
import { makeStore } from '@/lib/redux/store'

function loggedInStore() {
  const store = makeStore()
  store.dispatch(
    setCredentials({
      token: 'token-user-1',
      user: {
        uid: 'sogo-tests1@example.org',
        cn: 'Didy',
        email: 'sogo-tests1@example.org',
      },
      rememberMe: false,
    })
  )
  return store
}

describe('offline wipe on logout', () => {
  beforeEach(() => {
    mockStartLogoutWipe.mockClear()
  })

  it('wipes the offline data of the user who logged out', () => {
    const store = loggedInStore()

    store.dispatch(logout())

    // The uid is read before the reducer cleared it.
    expect(store.getState().auth.user).toBeNull()
    expect(mockStartLogoutWipe).toHaveBeenCalledTimes(1)
    expect(mockStartLogoutWipe).toHaveBeenCalledWith('sogo-tests1@example.org')
  })

  it('runs for any logout dispatch, not only the header button', () => {
    const store = loggedInStore()

    // Same action the 401 handler and the mail error screens dispatch.
    store.dispatch(logout())
    store.dispatch(logout())

    expect(mockStartLogoutWipe).toHaveBeenNthCalledWith(
      1,
      'sogo-tests1@example.org'
    )
    // Already logged out: nothing left to identify.
    expect(mockStartLogoutWipe).toHaveBeenNthCalledWith(2, undefined)
  })
})
