/**
 * PWA / offline feature flags.
 * Master flag defaults to off until rollout (Epic 8).
 *
 * NEXT_PUBLIC_* keys MUST be written as static `process.env.NEXT_PUBLIC_…`
 * member access so Next/Turbopack can inline them into the client bundle.
 * Dynamic `process.env[name]` is always undefined in the browser.
 */

function isOn(value: string | undefined): boolean {
  return value === 'true' || value === '1'
}

function isExplicitlyOff(value: string | undefined): boolean {
  return value === 'false' || value === '0'
}

export function isPwaEnabled(): boolean {
  return isOn(process.env.NEXT_PUBLIC_PWA_ENABLED)
}

export function isPwaOutboxEnabled(): boolean {
  return isPwaEnabled() && !isExplicitlyOff(process.env.NEXT_PUBLIC_PWA_OUTBOX)
}

export function isPwaMailCacheEnabled(): boolean {
  return (
    isPwaEnabled() && !isExplicitlyOff(process.env.NEXT_PUBLIC_PWA_MAIL_CACHE)
  )
}

export function isPwaBgSyncEnabled(): boolean {
  return isPwaEnabled() && !isExplicitlyOff(process.env.NEXT_PUBLIC_PWA_BG_SYNC)
}

/** Opt-in: calendar cache stays off unless explicitly enabled. */
export function isPwaCalendarCacheEnabled(): boolean {
  return isPwaEnabled() && isOn(process.env.NEXT_PUBLIC_PWA_CALENDAR_CACHE)
}
