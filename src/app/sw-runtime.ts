/** Navigation reloads sometimes have an empty `destination` in the SW. */
export function isNavigationRequest(
  request: Pick<Request, 'mode' | 'destination'>
): boolean {
  return request.mode === 'navigate' || request.destination === 'document'
}

/** Keep in sync with `getLocales()` — do not import next-intl into the SW. */
export const OFFLINE_FALLBACK_LOCALES = ['en', 'de', 'fr', 'es'] as const

/**
 * Document fallback for a failed navigation: `/{locale}/~offline` when the
 * request path starts with a known locale, otherwise the locale-less page.
 */
export function offlineFallbackPath(requestUrl: string): string {
  try {
    const path = new URL(requestUrl, 'http://localhost').pathname
    const first = path.split('/').filter(Boolean)[0]
    if (
      first &&
      (OFFLINE_FALLBACK_LOCALES as readonly string[]).includes(first)
    ) {
      return `/${first}/~offline`
    }
  } catch {
    // Invalid URL — use the unlocalized fallback.
  }
  return '/~offline'
}

/**
 * URLs Serwist may add to the precache manifest that 404 at install
 * (next/font serves hashed `/_next/static/media/*`, no public/robots.txt).
 */
export function isBrokenPrecacheUrl(url: string): boolean {
  const path = url.replace(/^https?:\/\/[^/]+/i, '').split('?')[0] ?? url
  return path === '/robots.txt' || path.startsWith('/fonts/OpenDyslexic')
}

export function filterPrecacheEntries<T extends string | { url: string }>(
  entries: T[] | undefined
): T[] {
  return (entries ?? []).filter((entry) => {
    const url = typeof entry === 'string' ? entry : entry.url
    return !isBrokenPrecacheUrl(url)
  })
}
