/**
 * PWA / offline feature flags.
 * Master flag defaults to off until rollout (Epic 8).
 */

function envFlag(name: string, defaultValue = false): boolean {
  if (typeof process === 'undefined') return defaultValue
  const raw = process.env[name]
  if (raw === undefined || raw === '') return defaultValue
  return raw === 'true' || raw === '1'
}

export function isPwaEnabled(): boolean {
  return envFlag('NEXT_PUBLIC_PWA_ENABLED', false)
}

export function isPwaOutboxEnabled(): boolean {
  return isPwaEnabled() && envFlag('NEXT_PUBLIC_PWA_OUTBOX', true)
}

export function isPwaMailCacheEnabled(): boolean {
  return isPwaEnabled() && envFlag('NEXT_PUBLIC_PWA_MAIL_CACHE', true)
}

export function isPwaBgSyncEnabled(): boolean {
  return isPwaEnabled() && envFlag('NEXT_PUBLIC_PWA_BG_SYNC', true)
}
