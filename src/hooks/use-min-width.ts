'use client'

import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'
import { useState } from 'react'

/** Content-box width of an element (what a CSS container query measures). */
function getContentWidth(element: HTMLElement): number {
  const style = window.getComputedStyle(element)
  const padding =
    (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0)
  return element.clientWidth - padding
}

/**
 * Whether an element's content box is at least `minWidth` px wide, kept up to
 * date on resize. Unlike a container query, the result can drive the DOM
 * (e.g. the order of elements, for keyboard navigation). Measured before
 * paint, so the first frame already has the right layout.
 *
 * Attach `ref` (a callback ref) to the element; `false` until it is measured.
 */
export function useMinWidth<T extends HTMLElement>(minWidth: number) {
  const [element, setElement] = useState<T | null>(null)
  const [matches, setMatches] = useState(false)

  useIsomorphicLayoutEffect(() => {
    if (!element) return
    const update = () => setMatches(getContentWidth(element) >= minWidth)
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, minWidth])

  return { ref: setElement, matches }
}
