import { defineRouting } from 'next-intl/routing'
import { getDefaultLocale, getLocales } from './config'

export default defineRouting({
  locales: getLocales(),
  defaultLocale: getDefaultLocale(),
})
