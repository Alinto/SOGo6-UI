import { shouldSkipDocumentNav } from '../network/skip-document-nav'

export type LogoutRedirect =
  | { mode: 'push'; href: '/auth/login' }
  | { mode: 'stay' }

/**
 * Client-side `router.push('/auth/login')` while offline is an RSC flight
 * that the SW replaces with `/~offline`. Stay on the current document and
 * let the logged-in layout render the login shell instead.
 */
export function resolveLogoutRedirect(
  skipDocumentNav: boolean
): LogoutRedirect {
  if (skipDocumentNav) {
    return { mode: 'stay' }
  }
  return { mode: 'push', href: '/auth/login' }
}

export function redirectAfterLogout(push: (href: string) => void): void {
  const skip =
    typeof navigator !== 'undefined' &&
    shouldSkipDocumentNav(navigator.onLine, false)
  const target = resolveLogoutRedirect(skip)
  if (target.mode === 'stay') return
  push(target.href)
}
