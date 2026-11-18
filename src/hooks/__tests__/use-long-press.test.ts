import { LONG_PRESS_DELAY, useLongPress } from '@/hooks/use-long-press'
import { act, renderHook } from '@testing-library/react'
import type React from 'react'

const contextMenuEvent = () =>
  ({ preventDefault: jest.fn() }) as unknown as React.MouseEvent & {
    preventDefault: jest.Mock
  }

describe('useLongPress', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('fires after the delay and flags the next click once', () => {
    const onLongPress = jest.fn()
    const { result } = renderHook(() => useLongPress(onLongPress))

    act(() => result.current.handlers.onTouchStart())
    act(() => jest.advanceTimersByTime(LONG_PRESS_DELAY))

    expect(onLongPress).toHaveBeenCalledTimes(1)
    expect(result.current.consumeLongPress()).toBe(true)
    expect(result.current.consumeLongPress()).toBe(false)
  })

  it.each(['onTouchEnd', 'onTouchMove', 'onTouchCancel'] as const)(
    'is cancelled by %s before the delay',
    (handler) => {
      const onLongPress = jest.fn()
      const { result } = renderHook(() => useLongPress(onLongPress))

      act(() => result.current.handlers.onTouchStart())
      act(() => result.current.handlers[handler]())
      act(() => jest.advanceTimersByTime(LONG_PRESS_DELAY))

      expect(onLongPress).not.toHaveBeenCalled()
      expect(result.current.consumeLongPress()).toBe(false)
    }
  )

  it('blocks the context menu only during a press', () => {
    const { result } = renderHook(() => useLongPress(jest.fn()))

    const idle = contextMenuEvent()
    result.current.handlers.onContextMenu(idle)
    expect(idle.preventDefault).not.toHaveBeenCalled()

    act(() => result.current.handlers.onTouchStart())
    const pressing = contextMenuEvent()
    result.current.handlers.onContextMenu(pressing)
    expect(pressing.preventDefault).toHaveBeenCalled()
  })

  it('does not fire after unmount', () => {
    const onLongPress = jest.fn()
    const { result, unmount } = renderHook(() => useLongPress(onLongPress))

    act(() => result.current.handlers.onTouchStart())
    unmount()
    jest.advanceTimersByTime(LONG_PRESS_DELAY)

    expect(onLongPress).not.toHaveBeenCalled()
  })
})
