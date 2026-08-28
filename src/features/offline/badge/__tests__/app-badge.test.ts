/**
 * @jest-environment jsdom
 */

const mockCount = jest.fn(async () => 3)

jest.mock('../../db/mail-cache-store', () => ({
  countUnseenCachedHeaders: () => mockCount(),
}))

import { syncAppBadge } from '../app-badge'

describe('syncAppBadge', () => {
  const setAppBadge = jest.fn(async () => undefined)
  const clearAppBadge = jest.fn(async () => undefined)

  beforeEach(() => {
    setAppBadge.mockClear()
    clearAppBadge.mockClear()
    Object.defineProperty(navigator, 'setAppBadge', {
      configurable: true,
      value: setAppBadge,
    })
    Object.defineProperty(navigator, 'clearAppBadge', {
      configurable: true,
      value: clearAppBadge,
    })
  })

  it('sets the unread count', async () => {
    mockCount.mockResolvedValueOnce(3)
    await syncAppBadge('user@example.org')
    expect(setAppBadge).toHaveBeenCalledWith(3)
  })

  it('clears the badge when there is no unread mail', async () => {
    mockCount.mockResolvedValueOnce(0)
    await syncAppBadge('user@example.org')
    expect(clearAppBadge).toHaveBeenCalled()
  })

  it('clears the badge on logout', async () => {
    await syncAppBadge(null)
    expect(clearAppBadge).toHaveBeenCalled()
  })
})
