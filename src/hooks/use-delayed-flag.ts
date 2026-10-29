import { useEffect, useState } from 'react'

/**
 * Returns `true` once `active` has stayed `true` for `delayMs`, and `false`
 * as soon as `active` turns `false`. Avoids flashing a loader for short work.
 */
export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [delayed, setDelayed] = useState(false)

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setDelayed(true), delayMs)
    return () => {
      clearTimeout(timer)
      setDelayed(false)
    }
  }, [active, delayMs])

  return active && delayed
}
