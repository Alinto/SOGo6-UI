import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useInterval } from '../use-interval'

describe('useInterval', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Basic behaviour', () => {
    it('calls callback after delay', () => {
      const callback = jest.fn()
      renderHook(() => useInterval(callback, 1000))

      expect(callback).not.toHaveBeenCalled()
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('calls callback multiple times', () => {
      const callback = jest.fn()
      renderHook(() => useInterval(callback, 1000))

      act(() => {
        jest.advanceTimersByTime(3000)
      })
      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('respects the delay interval', () => {
      const callback = jest.fn()
      renderHook(() => useInterval(callback, 500))

      act(() => {
        jest.advanceTimersByTime(499)
      })
      expect(callback).toHaveBeenCalledTimes(0)

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('is enabled by default', () => {
      const callback = jest.fn()
      renderHook(() => useInterval(callback, 1000))

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('enabled flag', () => {
    it('does not call callback when enabled is false', () => {
      const callback = jest.fn()
      renderHook(() => useInterval(callback, 1000, false))

      act(() => {
        jest.advanceTimersByTime(5000)
      })
      expect(callback).not.toHaveBeenCalled()
    })

    it('starts calling callback when enabled switches from false to true', () => {
      const callback = jest.fn()
      let enabled = false

      const { rerender } = renderHook(() =>
        useInterval(callback, 1000, enabled)
      )

      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(callback).not.toHaveBeenCalled()

      enabled = true
      rerender()

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('stops calling callback when enabled switches from true to false', () => {
      const callback = jest.fn()
      let enabled = true

      const { rerender } = renderHook(() =>
        useInterval(callback, 1000, enabled)
      )

      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(callback).toHaveBeenCalledTimes(2)

      enabled = false
      rerender()

      act(() => {
        jest.advanceTimersByTime(3000)
      })
      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  describe('Stale closure safety', () => {
    it('always calls the latest callback without restarting the interval', () => {
      let value = 'first'
      const results: string[] = []

      const { rerender } = renderHook(() => {
        const cb = () => results.push(value)
        useInterval(cb, 1000)
      })

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(results).toEqual(['first'])

      value = 'second'
      rerender()

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(results).toEqual(['first', 'second'])
    })

    it('uses updated callback after rerender without resetting timer', () => {
      const callbackV1 = jest.fn()
      const callbackV2 = jest.fn()
      let currentCallback = callbackV1

      const { rerender } = renderHook(() => useInterval(currentCallback, 1000))

      act(() => {
        jest.advanceTimersByTime(500)
      })

      currentCallback = callbackV2
      rerender()

      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(callbackV1).not.toHaveBeenCalled()
      expect(callbackV2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cleanup', () => {
    it('clears interval on unmount', () => {
      const callback = jest.fn()
      const { unmount } = renderHook(() => useInterval(callback, 1000))

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(callback).toHaveBeenCalledTimes(1)

      unmount()

      act(() => {
        jest.advanceTimersByTime(3000)
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('clears previous interval when delay changes', () => {
      const callback = jest.fn()
      let delay = 1000

      const { rerender } = renderHook(() => useInterval(callback, delay))

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(callback).toHaveBeenCalledTimes(1)

      delay = 2000
      rerender()

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(callback).toHaveBeenCalledTimes(1)

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('does not leave dangling intervals when enabled toggles', () => {
      const callback = jest.fn()
      let enabled = true

      const { rerender } = renderHook(() =>
        useInterval(callback, 1000, enabled)
      )

      enabled = false
      rerender()
      enabled = true
      rerender()

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('Delay variations', () => {
    it('works with very short delay', () => {
      const callback = jest.fn()
      renderHook(() => useInterval(callback, 100))

      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(callback).toHaveBeenCalledTimes(5)
    })

    it('works with long delay', () => {
      const callback = jest.fn()
      renderHook(() => useInterval(callback, 60000))

      act(() => {
        jest.advanceTimersByTime(59999)
      })
      expect(callback).toHaveBeenCalledTimes(0)

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
})
