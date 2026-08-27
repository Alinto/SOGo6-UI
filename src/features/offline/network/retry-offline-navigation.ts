import { pwaStartUrl } from '@/features/offline/pwa-start-url'

export type OfflineRetry = { type: 'back' } | { type: 'assign'; href: string }

export function resolveOfflineRetry(
  historyLength: number,
  fallbackHref: string
): OfflineRetry {
  if (historyLength > 1) return { type: 'back' }
  return { type: 'assign', href: fallbackHref }
}

/** Stay in the app: never send `/~offline` “Try again” to `/` (login). */
export function retryOfflineNavigation(fallbackHref?: string): void {
  if (typeof window === 'undefined') return
  const href = fallbackHref ?? pwaStartUrl()
  const next = resolveOfflineRetry(window.history.length, href)
  if (next.type === 'back') {
    window.history.back()
    return
  }
  window.location.assign(next.href)
}
