/**
 * Generates a client-side unique id.
 * Uses crypto.randomUUID when available (secure contexts: HTTPS, localhost).
 * Falls back to a time/random string on plain HTTP where randomUUID is unavailable.
 */
export function createClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`
}
