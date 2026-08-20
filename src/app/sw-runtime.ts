/** Navigation reloads sometimes have an empty `destination` in the SW. */
export function isNavigationRequest(
  request: Pick<Request, 'mode' | 'destination'>
): boolean {
  return request.mode === 'navigate' || request.destination === 'document'
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
