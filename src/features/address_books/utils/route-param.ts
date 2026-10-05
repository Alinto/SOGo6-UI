/** Undo one `encodeURIComponent` pass. `useParams()` already returns that form. */
export function decodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Encode a URL path segment once.
 * Accepts a raw value (`user@example.org`) or one Next already encoded
 * (`user%40example.org`) and always produces a single encoding (`%40`).
 */
export function encodePathSegment(value: string): string {
  return encodeURIComponent(decodeRouteParam(value))
}

export function routeParam(
  value: string | string[] | undefined | null
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.length === 0) return undefined
  return decodeRouteParam(raw)
}
