import { renderHook, act } from '@testing-library/react'
import { useOnlineStatus } from '../use-online-status'

describe('useOnlineStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })
  })

  it('should return initial online status', () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(typeof result.current).toBe('boolean')
  })

  it('should return true when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })

    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)
  })

  it('should return false when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)
  })

  it('should update when online event fires', () => {
    const { result } = renderHook(() => useOnlineStatus())

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current).toBe(true)
  })

  it('should update when offline event fires', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })

    const { result } = renderHook(() => useOnlineStatus())

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current).toBe(false)
  })
})
