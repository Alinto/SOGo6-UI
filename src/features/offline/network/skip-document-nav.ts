/**
 * Never trigger a Next.js document/RSC navigation while we might be offline.
 * A failed App Router flight is replaced by the SW `/~offline` page.
 */
export function shouldSkipDocumentNav(
  isOnline: boolean,
  isProbing = false
): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true
  }
  return !isOnline || isProbing
}
