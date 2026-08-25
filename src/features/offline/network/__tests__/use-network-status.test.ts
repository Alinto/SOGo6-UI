/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import { probeNetwork } from '../probe'
import { useNetworkStatus } from '../use-network-status'

jest.mock('../probe', () => ({
  probeNetwork: jest.fn(),
}))

const mockProbe = probeNetwork as jest.MockedFunction<typeof probeNetwork>

describe('useNetworkStatus', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => true,
    })
  })

  it('shares one probe across hook instances', async () => {
    mockProbe.mockResolvedValue(true)
    const a = renderHook(() => useNetworkStatus())
    const b = renderHook(() => useNetworkStatus())

    await waitFor(() => {
      expect(a.result.current.isProbing).toBe(false)
      expect(b.result.current.isProbing).toBe(false)
    })

    expect(mockProbe).toHaveBeenCalledTimes(1)
    expect(a.result.current.isOnline).toBe(true)
    expect(b.result.current.isOnline).toBe(true)

    a.unmount()
    b.unmount()
  })

  it('retries the probe when navigator is online but the last probe failed', async () => {
    jest.useFakeTimers()
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => true,
    })
    mockProbe.mockResolvedValueOnce(false).mockResolvedValue(true)

    const { result, unmount } = renderHook(() => useNetworkStatus())

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(result.current.isOnline).toBe(false)
    expect(result.current.isProbing).toBe(false)

    await act(async () => {
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(result.current.isOnline).toBe(true)
    unmount()
    jest.useRealTimers()
  })
})
