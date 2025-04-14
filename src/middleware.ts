import createMiddleware from 'next-intl/middleware'
import { defineRouting } from 'next-intl/routing'
import { NextRequest, NextResponse } from 'next/server'

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
const middleware = createMiddleware(routing)

export default async function handler(req: NextRequest) {
  const res = await middleware(req)
  const locales = getLocales()
  const defaultLocale = getDefaultLocale()
  const localeRegex = generateLocaleRegex(locales)

  // Check if the pathname matches the locale regex
  if (!localeRegex.test(req.nextUrl.pathname)) {
    // Redirect to the default locale
    const queryParams = req.nextUrl.search
    const url = new URL(
      `/${defaultLocale}${req.nextUrl.pathname}${queryParams}`,
      req.url
    )
    return NextResponse.redirect(url)
  }

  return res
}
export const config = {
  matcher: ['/((?!_next|fakeApi|.*\\..*).*)'],
}
