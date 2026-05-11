import type { Locale } from 'date-fns'
import { de, enUS, es, fr } from 'date-fns/locale'
import { getDefaultLocale, getLocales } from './config'

/**
 * Mapping between next-intl locales and date-fns locales
 * Synchronized with i18n config
 */
/** next-intl locale key → date-fns locale (used by RBC + getDateFnsLocale) */
export const DATE_LOCALES: Record<string, Locale> = {
  en: enUS,
  de: de,
  fr: fr,
  es: es,
  // Add more locales here as needed:
}

/**
 * Get date-fns locale from next-intl locale string
 * Falls back to default locale if not found
 *
 * @param locale - Next-intl locale string (e.g., 'en', 'fr')
 * @returns date-fns Locale object
 *
 * @example
 * const locale = getDateFnsLocale('fr') // Returns fr locale
 * format(new Date(), 'EEEE', { locale })
 */
export const getDateFnsLocale = (locale: string): Locale => {
  const dateFnsLocale = DATE_LOCALES[locale]

  if (!dateFnsLocale) {
    const defaultLocale = getDefaultLocale()
    console.warn(
      `[date-locales] Locale "${locale}" not found in date-fns locales. Falling back to "${defaultLocale}".`
    )
    return DATE_LOCALES[defaultLocale] || enUS
  }

  return dateFnsLocale
}

/**
 * Get all available date-fns locales
 * Useful for validation or debugging
 *
 * @returns Array of locale keys
 */
export const getAvailableDateLocales = (): string[] => {
  return Object.keys(DATE_LOCALES)
}

/**
 * Check if a locale is supported by date-fns
 *
 * @param locale - Locale string to check
 * @returns true if locale is supported
 */
export const isDateLocaleSupported = (locale: string): boolean => {
  return locale in DATE_LOCALES
}

/**
 * Validate that all next-intl locales have corresponding date-fns locales
 * Logs warnings for missing locales
 * Should be called during app initialization (e.g., in middleware or layout)
 */
export const validateDateLocales = (): void => {
  const nextIntlLocales = getLocales()
  const dateLocales = getAvailableDateLocales()
  const missing = nextIntlLocales.filter(
    (locale) => !dateLocales.includes(locale)
  )

  if (missing.length > 0) {
    console.warn(
      `[date-locales] The following next-intl locales are missing date-fns locales: ${missing.join(', ')}`
    )
  }
}

// Validate on module load (development only)
if (process.env.NODE_ENV === 'development') {
  validateDateLocales()
}
