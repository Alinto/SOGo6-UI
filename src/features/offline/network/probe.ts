/** Must stay in sync with the NetworkOnly matcher in `src/app/sw.ts`. */
export const NETWORK_PROBE_URL = '/env?probe=1'

/**
 * Probe real connectivity (avoids captive-portal false positives from navigator.onLine).
 * Uses a dedicated URL the service worker never caches — a cached `/env` would
 * look "online" after F5 with DevTools Offline.
 */
export async function probeNetwork(timeoutMs = 4000): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(NETWORK_PROBE_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}
