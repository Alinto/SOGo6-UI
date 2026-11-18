import {
  getFittingLevelCount,
  MAX_BREADCRUMB_LEVELS,
} from '@/features/mails/utils/get-folder-breadcrumb'
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'
import { useCallback, useEffect, useRef, useState } from 'react'

/** Gap between the breadcrumb and its suffix (Tailwind `gap-2`). */
export const BREADCRUMB_SUFFIX_GAP = 8

export const MEASURE_ATTRIBUTE = 'data-breadcrumb-measure'

/**
 * Picks how many folders the breadcrumb can show in the space it has.
 *
 * - `containerRef`: the box whose width is the available space;
 * - `measureRef`: a hidden row rendering every folder (`data-breadcrumb-measure
 *   ="folder"`) and the "…" (`="ellipsis"`) at their natural width;
 * - `suffixRef`: optional content shown after the breadcrumb (its width and
 *   the gap are taken from the available space).
 *
 * `measureKey` must change when the folders or their labels change. Until a
 * measure is possible (server render, hidden container) the count is
 * `MAX_BREADCRUMB_LEVELS`.
 */
export function useBreadcrumbFit(measureKey: string) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLOListElement>(null)
  const suffixRef = useRef<HTMLSpanElement>(null)
  const [levelCount, setLevelCount] = useState(MAX_BREADCRUMB_LEVELS)

  const measure = useCallback(() => {
    const container = containerRef.current
    const row = measureRef.current
    if (!container || !row) return

    const itemWidths = Array.from(
      row.querySelectorAll<HTMLElement>(`[${MEASURE_ATTRIBUTE}="folder"]`),
      (el) => el.offsetWidth
    )
    const ellipsisWidth =
      row.querySelector<HTMLElement>(`[${MEASURE_ATTRIBUTE}="ellipsis"]`)
        ?.offsetWidth ?? 0
    const suffix = suffixRef.current
    const suffixWidth = suffix ? suffix.offsetWidth + BREADCRUMB_SUFFIX_GAP : 0
    const availableWidth = container.offsetWidth - suffixWidth

    // Not laid out (hidden, or no layout engine): keep the current count.
    if (container.offsetWidth === 0 || itemWidths.length === 0) return

    setLevelCount(
      getFittingLevelCount({ itemWidths, ellipsisWidth, availableWidth })
    )
  }, [])

  // Before paint, so the first frame already has the right count.
  useIsomorphicLayoutEffect(() => {
    measure()
  }, [measure, measureKey])

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => measure())
    for (const el of [
      containerRef.current,
      measureRef.current,
      suffixRef.current,
    ]) {
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [measure, measureKey])

  return { containerRef, measureRef, suffixRef, levelCount }
}
