const mockWipe = jest.fn()

jest.mock('../../db/wipe', () => ({
  wipeOfflineUserData: (...args: unknown[]) => mockWipe(...args),
}))

import { startLogoutWipe, waitForLogoutWipe } from '../logout-wipe'

function deferred() {
  let resolve: () => void = () => undefined
  let reject: (error: Error) => void = () => undefined
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('logout wipe', () => {
  beforeEach(() => {
    mockWipe.mockReset()
  })

  it('wipes the offline data of the user', async () => {
    mockWipe.mockResolvedValue(undefined)
    await startLogoutWipe('alice')
    expect(mockWipe).toHaveBeenCalledWith('alice')
  })

  it('wipes only once when the same user logs out twice', async () => {
    const pending = deferred()
    mockWipe.mockReturnValue(pending.promise)

    const first = startLogoutWipe('alice')
    const second = startLogoutWipe('alice')
    expect(second).toBe(first)
    expect(mockWipe).toHaveBeenCalledTimes(1)

    pending.resolve()
    await first
  })

  it('lets callers wait until the wipe is finished', async () => {
    const pending = deferred()
    mockWipe.mockReturnValue(pending.promise)
    void startLogoutWipe('alice')

    let done = false
    const waiting = waitForLogoutWipe().then(() => {
      done = true
    })
    await Promise.resolve()
    expect(done).toBe(false)

    pending.resolve()
    await waiting
    expect(done).toBe(true)
  })

  it('does not block the next login when the wipe fails', async () => {
    const pending = deferred()
    mockWipe.mockReturnValue(pending.promise)
    const wipe = startLogoutWipe('alice')

    pending.reject(new Error('blocked'))
    await expect(wipe).resolves.toBeUndefined()
    await expect(waitForLogoutWipe()).resolves.toBeUndefined()
  })

  it('wipes again on a later logout of the same user', async () => {
    mockWipe.mockResolvedValue(undefined)
    await startLogoutWipe('alice')
    await startLogoutWipe('alice')
    expect(mockWipe).toHaveBeenCalledTimes(2)
  })

  it('does nothing without a user id', async () => {
    await startLogoutWipe(undefined)
    expect(mockWipe).not.toHaveBeenCalled()
  })
})
