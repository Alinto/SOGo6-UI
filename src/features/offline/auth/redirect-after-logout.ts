import { offlineLoginPath } from '@/app/sw-runtime'
import { shouldSkipDocumentNav } from '../network/skip-document-nav'

export const SESSION_EXPIRED_REASON = 'session'

export type LogoutRedirect =
  | { mode: 'push'; href: string }
  | { mode: 'replace-login'; href: string }

/**
 * Client-side `router.push('/auth/login')` while offline is an RSC flight
 * that the SW replaces with `/~offline`. Replace the URL with the precached
 * login path (no document nav) and let the logged-in layout render the login
 * shell. A later reload then hits CacheFirst login instead of `~offline`.
 */
export function loginPath(reason?: typeof SESSION_EXPIRED_REASON): string {
  if (reason === SESSION_EXPIRED_REASON) {
    return `/auth/login?reason=${SESSION_EXPIRED_REASON}`
  }
  return '/auth/login'
}

export function resolveLogoutRedirect(
  skipDocumentNav: boolean,
  currentUrl = '',
  reason?: typeof SESSION_EXPIRED_REASON
): LogoutRedirect {
  if (skipDocumentNav) {
    return { mode: 'replace-login', href: offlineLoginPath(currentUrl) }
  }
  return { mode: 'push', href: loginPath(reason) }
}

export function redirectAfterLogout(
  push: (href: string) => void,
  reason?: typeof SESSION_EXPIRED_REASON
): void {
  const skip =
    typeof navigator !== 'undefined' &&
    shouldSkipDocumentNav(navigator.onLine, false)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const target = resolveLogoutRedirect(skip, currentUrl, reason)
  if (target.mode === 'replace-login') {
    window.history.replaceState(window.history.state, '', target.href)
    return
  }
  push(target.href)
}
