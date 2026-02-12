import { getDefaultLocale, getLocales, routing } from '@/lib/i18n/config'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Pre-compile configuration at module load time to avoid recalculating on every request
const LOCALES = getLocales();
const DEFAULT_LOCALE = getDefaultLocale();
const LOCALE_PATTERN = LOCALES.join('|');

// Pre-compiled regular expressions for better performance
const LOCALE_REGEX = new RegExp(`^/(${LOCALE_PATTERN})(/|$)`);
const ADMIN_PATH_REGEX = new RegExp(`^/(${LOCALE_PATTERN})/admin_panel(/.*)?$`);
const LOCALE_ROOT_REGEX = new RegExp(`^/(${LOCALE_PATTERN})/?$`);
const AUTH_PATH_REGEX = new RegExp(`^/(${LOCALE_PATTERN})/auth(/|$)`);

// Parse admin domains once at startup
const ADMIN_DOMAINS = new Set(
  (process.env.NEXT_PUBLIC_ADMIN_DOMAINS?.split(',') || []).map(d => d.trim())
);

export const config = {
  matcher: [
    '/((?!_next|fakeApi|env|manifest\\.webmanifest|offline|.*\\.(?:js|css|png|jpg|jpeg|svg|gif|ico|webp|woff|woff2|ttf|eot)$).*)',
  ],
}

function isAdminDomain(hostname: string): boolean {
  return Array.from(ADMIN_DOMAINS).some((domain) => hostname.includes(domain))
}

const middleware = createMiddleware(routing)

export default async function handler(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  const isAdmin = isAdminDomain(hostname)
  const isAdminPanelRoute = ADMIN_PATH_REGEX.test(pathname)
  const isAuthRoute = AUTH_PATH_REGEX.test(pathname)
  const isLocaleRoot = LOCALE_ROOT_REGEX.test(pathname)

  // Redirect to default locale if pathname doesn't start with a locale
  if (!LOCALE_REGEX.test(pathname)) {
    const queryParams = req.nextUrl.search
    const url = new URL(`/${DEFAULT_LOCALE}${pathname}${queryParams}`, req.url)
    return NextResponse.redirect(url)
  }

  // Allow auth routes on both admin and user domains
  if (isAuthRoute) {
    return await middleware(req)
  }

  // Admin domain: redirect all non-admin_panel routes to admin_panel
  if (isAdmin) {
    if (isLocaleRoot || !isAdminPanelRoute) {
      const locale = pathname.split('/')[1]
      const url = new URL(`/${locale}/admin_panel`, req.url)
      return NextResponse.redirect(url)
    }
  }

  // User domain: block admin_panel routes in production
  if (!isAdmin && isAdminPanelRoute && process.env.NODE_ENV === 'production') {
    const url = new URL(`/${DEFAULT_LOCALE}`, req.url)
    return NextResponse.redirect(url)
  }

  return await middleware(req)
}
