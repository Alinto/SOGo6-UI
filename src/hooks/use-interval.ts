import { useEffect, useRef, useCallback } from 'react'
 
/**
 * Calls `callback` every `delay` ms.
 * Pauses when `enabled` is false (e.g. draft is minimized or pristine).
 * The callback ref is always kept up to date — no stale closure risk.
 */
export function useInterval(
  callback: () => void,
  delay: number,
  enabled = true
) {
  const savedCallback = useRef(callback)
 
  // Keep ref current without restarting the interval
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
 
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay, enabled])
}
 
