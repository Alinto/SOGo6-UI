import createMiddleware from 'next-intl/middleware'
import { defineRouting } from 'next-intl/routing'
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!_next|fakeApi|env|.*\\..*).*)'],
}

export function getLocales() {
  return ['en', 'de', 'fr', 'es']
}

export function getDefaultLocale() {
  return 'en'
}

export const routing = defineRouting({
  locales: getLocales(),
  defaultLocale: getDefaultLocale(),
  localePrefix: 'always',
  localeDetection: true,
})

// Function to generate a dynamic regex to test if pathname begins with one of the locales
export function generateLocaleRegex(locales: readonly string[]): RegExp {
  const localePattern = locales.join('|')
  return new RegExp(`^/(${localePattern})(/|$)`)
}

// Function to check if the request is from the admin domain
export function isAdminDomain(hostname: string): boolean {
  const adminDomains = process.env.NEXT_PUBLIC_ADMIN_DOMAINS?.split(',') || []
  return adminDomains.some((domain) => hostname.includes(domain.trim()))
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

const middleware = createMiddleware(routing)

export default async function handler(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname
  const locales = getLocales()
  const defaultLocale = getDefaultLocale()
  const localeRegex = generateLocaleRegex(locales)

  const isAdmin = isAdminDomain(hostname)
  const isAdminPanelRoute = isAdminPanelPath(pathname)
  const isAuthRoute = isAuthPath(pathname)
  const isLocaleRoot = isLocaleRootPath(pathname)

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
    return await middleware(req)
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
    // Redirect to home page if trying to access admin routes from user domain
    const url = new URL(`/${defaultLocale}`, req.url)
    return NextResponse.redirect(url)
  }

  const res = await middleware(req)
  return res
}
