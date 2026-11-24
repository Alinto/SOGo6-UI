/** Height of a row in the icon rail (Tailwind `h-10`). */
export const RAIL_ROW_HEIGHT = 40
/** Gap between the rail entries (`SidebarMenu`'s `gap-1`). */
export const RAIL_GAP = 4
/** Section line: 1px plus its `my-1` margins. */
export const RAIL_SEPARATOR_HEIGHT = 9

export interface FittedRailSections<T> {
  sections: T[][]
  hiddenCount: number
}

/**
 * Keeps, in order, the entries that fit in `availableHeight`, along with
 * the lines between sections. When some do not fit, the room of one more row
 * is kept for the "+N" entry. `null` (not measured yet) keeps everything.
 */
export function fitRailSections<T>(
  sections: T[][],
  availableHeight: number | null
): FittedRailSections<T> {
  const filled = sections.filter((section) => section.length > 0)
  if (availableHeight === null) return { sections: filled, hiddenCount: 0 }

  const total = filled.reduce((sum, section) => sum + section.length, 0)
  const fitted: T[][] = []
  let used = 0
  let shown = 0

  for (const section of filled) {
    const kept: T[] = []
    for (const [index, item] of section.entries()) {
      const separator =
        index === 0 && shown > 0 ? RAIL_SEPARATOR_HEIGHT + RAIL_GAP : 0
      const cost = (shown > 0 ? RAIL_GAP : 0) + separator + RAIL_ROW_HEIGHT
      const moreRow = shown + 1 < total ? RAIL_GAP + RAIL_ROW_HEIGHT : 0
      if (used + cost + moreRow > availableHeight) {
        if (kept.length > 0) fitted.push(kept)
        return { sections: fitted, hiddenCount: total - shown }
      }
      used += cost
      shown += 1
      kept.push(item)
    }
    fitted.push(kept)
  }

  return { sections: fitted, hiddenCount: 0 }
}
