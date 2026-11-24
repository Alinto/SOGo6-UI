'use client'

import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'
import { useState } from 'react'

/**
 * Height of an element, kept up to date on resize. Measured before paint, so
 * the first frame already uses it.
 *
 * Attach `ref` (a callback ref) to the element; `null` until it is laid out
 * (server render, hidden element, no layout engine).
 */
export function useElementHeight<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null)
  const [height, setHeight] = useState<number | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (!element) return
    const update = () => {
      const next = element.clientHeight
      setHeight(next > 0 ? next : null)
    }
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return { ref: setElement, height }
}
