import { useLatest } from '@/hooks/use-latest'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

export const LONG_PRESS_DELAY = 500

export interface LongPressHandlers {
  onTouchStart: () => void
  onTouchMove: () => void
  onTouchEnd: () => void
  onTouchCancel: () => void
  /** Blocks the native long-press menu (Android) while a press is held. */
  onContextMenu: (event: React.MouseEvent) => void
}

/**
 * Detects a touch long press. `handlers` go on the pressed element;
 * `consumeLongPress()` must be called from its click handler: it returns
 * true (once) when the click ends a long press, so the click can be ignored.
 */
export function useLongPress(
  onLongPress: () => void,
  delay: number = LONG_PRESS_DELAY
): { handlers: LongPressHandlers; consumeLongPress: () => boolean } {
  const onLongPressRef = useLatest(onLongPress)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedRef = useRef(false)

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => cancel, [cancel])

  const handlers = useMemo<LongPressHandlers>(
    () => ({
      onTouchStart: () => {
        cancel()
        firedRef.current = false
        timerRef.current = setTimeout(() => {
          timerRef.current = null
          firedRef.current = true
          onLongPressRef.current()
        }, delay)
      },
      onTouchMove: cancel,
      onTouchEnd: cancel,
      onTouchCancel: cancel,
      onContextMenu: (event) => {
        if (timerRef.current || firedRef.current) event.preventDefault()
      },
    }),
    [cancel, delay, onLongPressRef]
  )

  const consumeLongPress = useCallback(() => {
    const fired = firedRef.current
    firedRef.current = false
    return fired
  }, [])

  return { handlers, consumeLongPress }
}
