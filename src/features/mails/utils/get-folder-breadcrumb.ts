import type { ImapFolder } from '../mails-types'

/**
 * Returns the chain of folders from the root of the IMAP tree down to the
 * folder at `path` (e.g. "INBOX/Work" → [INBOX, Work]). Walks the tree
 * instead of splitting the path, so it follows the real delimiter and keeps
 * non-selectable intermediate folders. Returns [] when the path is not found.
 */
export function getFolderBreadcrumb(
  folders: ImapFolder[],
  path: string
): ImapFolder[] {
  if (!path) return []
  const target = path.toLowerCase()

  const walk = (nodes: ImapFolder[], ancestors: ImapFolder[]): ImapFolder[] => {
    for (const folder of nodes) {
      const chain = [...ancestors, folder]
      if (folder.path.toLowerCase() === target) return chain
      const found = walk(folder.subfolders ?? folder.children ?? [], chain)
      if (found.length > 0) return found
    }
    return []
  }

  return walk(folders, [])
}

/** Maximum number of folders shown in the breadcrumb before collapsing. */
export const MAX_BREADCRUMB_LEVELS = 5

/**
 * Splits a breadcrumb chain so at most `max` folders are shown: the first
 * one, then the hidden middle ones (rendered as "…"), then the last
 * `max - 1`. `hidden` is empty when the chain already fits.
 */
export function collapseBreadcrumb<T>(
  chain: T[],
  max: number = MAX_BREADCRUMB_LEVELS
): { leading: T[]; hidden: T[]; trailing: T[] } {
  const tailSize = max - 1
  if (tailSize < 1 || chain.length <= max) {
    return { leading: chain, hidden: [], trailing: [] }
  }
  return {
    leading: chain.slice(0, 1),
    hidden: chain.slice(1, chain.length - tailSize),
    trailing: chain.slice(chain.length - tailSize),
  }
}

export interface FittingLevelCountInput {
  /** Natural width of each folder item, from the root to the current one. */
  itemWidths: number[]
  /** Width of the "…" item. */
  ellipsisWidth: number
  /** Width the breadcrumb may use. */
  availableWidth: number
  max?: number
}

/**
 * Number of folders to show (see `collapseBreadcrumb`) so the breadcrumb
 * fits in `availableWidth`: all of them when they fit (up to `max`), else the
 * first one, "…" and as many last ones as possible. Never less than 2 (first
 * + current); the current folder then shrinks.
 */
export function getFittingLevelCount({
  itemWidths,
  ellipsisWidth,
  availableWidth,
  max = MAX_BREADCRUMB_LEVELS,
}: FittingLevelCountInput): number {
  const n = itemWidths.length
  const sum = (widths: number[]) => widths.reduce((acc, w) => acc + w, 0)

  if (n <= max && sum(itemWidths) <= availableWidth) return n

  const first = itemWidths[0] ?? 0
  for (let k = Math.min(max, n - 1); k >= 2; k--) {
    const tail = sum(itemWidths.slice(n - (k - 1)))
    if (first + ellipsisWidth + tail <= availableWidth) return k
  }
  return Math.min(n, 2)
}
