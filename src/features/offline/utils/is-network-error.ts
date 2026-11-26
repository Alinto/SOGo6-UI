/**
 * True when a failed RTK Query request says nothing about the resource
 * itself: the server was unreachable or unavailable. Only then may a cached
 * copy stand in for it. A 4xx (404 deleted, 403 revoked, 401 expired) means
 * the cached copy must not be shown as current.
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('status' in error)) return false
  const { status } = error as { status: unknown }
  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') return true
  return typeof status === 'number' && status >= 500
}
