import { getDefaultLocale, getLocales, routing } from '@/lib/i18n/config'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    // Exclude api, fakeApi, env, PWA assets (manifest / serwist / offline fallback), and static files
    '/((?!_next|api|fakeApi|env|serwist|~offline|manifest\\.webmanifest|.*\\.(?:js|css|png|jpg|jpeg|svg|gif|ico|webp|woff|woff2|ttf|eot|webmanifest)$).*)',
  ],
}

// Function to generate a dynamic regex to test if pathname begins with one of the locales
export function generateLocaleRegex(locales: readonly string[]): RegExp {
  const localePattern = locales.join('|')
  return new RegExp(`^/(${localePattern})(/|$)`)
}

/** Strip port from host header before domain comparison. */
export function normalizeHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

/** Strict hostname equality (no substring match). */
export function hostnameMatchesAdminDomain(
  hostname: string,
  domain: string
): boolean {
  const normalizedDomain = domain.trim().toLowerCase()
  if (!normalizedDomain) {
    return false
  }
  return normalizeHostname(hostname) === normalizedDomain
}

// Function to check if the request is from the admin domain
export function isAdminDomain(hostname: string): boolean {
  const adminDomains = process.env.NEXT_PUBLIC_ADMIN_DOMAINS?.split(',') || []
  return adminDomains.some((domain) =>
    hostnameMatchesAdminDomain(hostname, domain)
  )
}

// Function to check if the path is admin panel (including all sub-routes)
export function isAdminPanelPath(pathname: string): boolean {
  const locales = getLocales()
  const localePattern = locales.join('|')
  // This regex matches /[locale]/admin_panel and all its sub-routes
  const adminPathRegex = new RegExp(`^/(${localePattern})/admin_panel(/.*)?$`)
  return adminPathRegex.test(pathname)
}

// Function to check if the path is just the locale root (e.g., /en, /fr)
export function isLocaleRootPath(pathname: string): boolean {
  const locales = getLocales()
  const localePattern = locales.join('|')
  const localeRootRegex = new RegExp(`^/(${localePattern})/?$`)
  return localeRootRegex.test(pathname)
}

// Function to check if the path is auth-related (login/signup)
export function isAuthPath(pathname: string): boolean {
  const locales = getLocales()
  const localePattern = locales.join('|')
  const authPathRegex = new RegExp(`^/(${localePattern})/auth(/|$)`)
  return authPathRegex.test(pathname)
}

const intlMiddleware = createMiddleware(routing)

/** PWA / installability paths must stay un-prefixed (no /en/…). */
export function isPwaAssetPath(pathname: string): boolean {
  return (
    pathname === '/manifest.webmanifest' ||
    pathname.endsWith('.webmanifest') ||
    pathname === '/~offline' ||
    pathname.startsWith('/~offline/') ||
    pathname.startsWith('/serwist/')
  )
}

export default async function proxy(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname
  const locales = getLocales()
  const defaultLocale = getDefaultLocale()
  const localeRegex = generateLocaleRegex(locales)

  const isAdmin = isAdminDomain(hostname)
  const isAdminPanelRoute = isAdminPanelPath(pathname)
  const isAuthRoute = isAuthPath(pathname)
  const isLocaleRoot = isLocaleRootPath(pathname)

  // Never locale-prefix PWA assets (manifest 404 under /en/… breaks installability)
  if (isPwaAssetPath(pathname)) {
    return NextResponse.next()
  }

  // Check if the pathname matches the locale regex
  if (!localeRegex.test(pathname)) {
    // Redirect to the default locale
    const queryParams = req.nextUrl.search
    const url = new URL(`/${defaultLocale}${pathname}${queryParams}`, req.url)
    return NextResponse.redirect(url)
  }

  // Domain-based routing logic
  // Allow auth routes on both domains
  if (isAuthRoute) {
    return await intlMiddleware(req)
  }

  // Admin domain - ONLY allow admin_panel routes
  if (isAdmin) {
    // If accessing locale root (e.g., /en), redirect to admin_panel
    if (isLocaleRoot) {
      const locale = pathname.split('/')[1]
      const url = new URL(`/${locale}/admin_panel`, req.url)
      return NextResponse.redirect(url)
    }

    // If NOT on admin_panel route, redirect to admin_panel
    if (!isAdminPanelRoute) {
      const locale = pathname.split('/')[1]
      const url = new URL(`/${locale}/admin_panel`, req.url)
      return NextResponse.redirect(url)
    }
  }

  // User domain - block admin_panel routes
  if (!isAdmin && isAdminPanelRoute) {
    // Allow admin routes in development mode
    if (process.env.NODE_ENV !== 'development') {
      // Redirect to home page if trying to access admin routes from user domain
      const url = new URL(`/${defaultLocale}`, req.url)
      return NextResponse.redirect(url)
    }
  }

  const res = await intlMiddleware(req)
  return res
}
