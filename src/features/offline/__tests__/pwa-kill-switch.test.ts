/**
 * @jest-environment jsdom
 */
import { disableInstalledPwa } from '../pwa-kill-switch'

describe('disableInstalledPwa', () => {
  afterEach(() => {
    // @ts-expect-error test cleanup
    delete navigator.serviceWorker
    // @ts-expect-error test cleanup
    delete globalThis.caches
  })

  it('unregisters the root-scope worker and deletes every cache', async () => {
    const rootReg = {
      scope: `${window.location.origin}/`,
      unregister: jest.fn().mockResolvedValue(true),
    }
    const otherReg = {
      scope: `${window.location.origin}/other/`,
      unregister: jest.fn().mockResolvedValue(true),
    }
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistrations: jest.fn().mockResolvedValue([rootReg, otherReg]),
      },
    })
    const cacheDelete = jest.fn().mockResolvedValue(true)
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(['serwist-precache-v2-x', 'env']),
        delete: cacheDelete,
      },
    })

    await disableInstalledPwa()

    expect(rootReg.unregister).toHaveBeenCalled()
    expect(otherReg.unregister).not.toHaveBeenCalled()
    expect(cacheDelete).toHaveBeenCalledWith('serwist-precache-v2-x')
    expect(cacheDelete).toHaveBeenCalledWith('env')
  })

  it('swallows errors from unavailable APIs', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistrations: jest.fn().mockRejectedValue(new Error('denied')),
      },
    })
    await expect(disableInstalledPwa()).resolves.toBeUndefined()
  })
})
