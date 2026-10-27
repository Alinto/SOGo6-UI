import { act, renderHook } from '@testing-library/react'
import { useDelayedFlag } from '../use-delayed-flag'

describe('useDelayedFlag', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('stays false while inactive', () => {
    const { result } = renderHook(() => useDelayedFlag(false, 300))
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current).toBe(false)
  })

  it('turns true only after the delay', () => {
    const { result } = renderHook(() => useDelayedFlag(true, 300))
    expect(result.current).toBe(false)
    act(() => {
      jest.advanceTimersByTime(299)
    })
    expect(result.current).toBe(false)
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current).toBe(true)
  })

  it('turns false at once when it becomes inactive', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useDelayedFlag(active, 300),
      { initialProps: { active: true } }
    )
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(result.current).toBe(true)
    rerender({ active: false })
    expect(result.current).toBe(false)
  })

  it('never turns true when it becomes inactive before the delay', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useDelayedFlag(active, 300),
      { initialProps: { active: true } }
    )
    act(() => {
      jest.advanceTimersByTime(100)
    })
    rerender({ active: false })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe(false)
  })

  it('restarts the delay when it becomes active again', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useDelayedFlag(active, 300),
      { initialProps: { active: true } }
    )
    act(() => {
      jest.advanceTimersByTime(300)
    })
    rerender({ active: false })
    rerender({ active: true })
    expect(result.current).toBe(false)
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(result.current).toBe(true)
  })
})
