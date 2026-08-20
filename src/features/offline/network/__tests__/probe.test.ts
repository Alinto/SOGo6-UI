/**
 * @jest-environment jsdom
 */
import { NETWORK_PROBE_URL, probeNetwork } from '../probe'

describe('probeNetwork', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => true,
    })
    delete (global as { fetch?: typeof fetch }).fetch
  })

  it('returns false without fetching when navigator is offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => false,
    })
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch

    await expect(probeNetwork()).resolves.toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('hits the uncached probe URL when navigator looks online', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => true,
    })
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch

    await expect(probeNetwork()).resolves.toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      NETWORK_PROBE_URL,
      expect.objectContaining({ cache: 'no-store' })
    )
  })

  it('returns false when the probe fetch fails', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => true,
    })
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new TypeError('Failed to fetch')
      ) as unknown as typeof fetch

    await expect(probeNetwork()).resolves.toBe(false)
  })
})
