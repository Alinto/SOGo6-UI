import { offlineLoginPath } from '@/app/sw-runtime'
import { shouldSkipDocumentNav } from '../network/skip-document-nav'

export type LogoutRedirect =
  | { mode: 'push'; href: '/auth/login' }
  | { mode: 'replace-login'; href: string }

/**
 * Client-side `router.push('/auth/login')` while offline is an RSC flight
 * that the SW replaces with `/~offline`. Replace the URL with the precached
 * login path (no document nav) and let the logged-in layout render the login
 * shell. A later reload then hits CacheFirst login instead of `~offline`.
 */
export function resolveLogoutRedirect(
  skipDocumentNav: boolean,
  currentUrl = ''
): LogoutRedirect {
  if (skipDocumentNav) {
    return { mode: 'replace-login', href: offlineLoginPath(currentUrl) }
  }
  return { mode: 'push', href: '/auth/login' }
}

export function redirectAfterLogout(push: (href: string) => void): void {
  const skip =
    typeof navigator !== 'undefined' &&
    shouldSkipDocumentNav(navigator.onLine, false)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const target = resolveLogoutRedirect(skip, currentUrl)
  if (target.mode === 'replace-login') {
    window.history.replaceState(window.history.state, '', target.href)
    return
  }
  push(target.href)
}
