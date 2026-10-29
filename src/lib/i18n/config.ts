import { defineRouting } from 'next-intl/routing'

export function getLocales() {
  return ['en']
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
