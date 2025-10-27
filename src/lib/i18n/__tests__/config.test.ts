import { getDefaultLocale, getLocales, routing } from '../config'

// Mock next-intl/routing to avoid ESM parsing issues in Jest
jest.mock('next-intl/routing', () => ({
  defineRouting: jest.fn((config) => config),
}))

describe('i18n config', () => {
  describe('getLocales', () => {
    it('should return an array of locale strings', () => {
      const locales = getLocales()
      expect(Array.isArray(locales)).toBe(true)
    })

    it('should return exactly 4 locales', () => {
      const locales = getLocales()
      expect(locales).toHaveLength(4)
    })

    it('should include English locale', () => {
      const locales = getLocales()
      expect(locales).toContain('en')
    })

    it('should include German locale', () => {
      const locales = getLocales()
      expect(locales).toContain('de')
    })

    it('should include French locale', () => {
      const locales = getLocales()
      expect(locales).toContain('fr')
    })

    it('should include Spanish locale', () => {
      const locales = getLocales()
      expect(locales).toContain('es')
    })

    it('should return the same locales on multiple calls', () => {
      const locales1 = getLocales()
      const locales2 = getLocales()
      expect(locales1).toEqual(locales2)
    })

    it('should return locales in expected order', () => {
      const locales = getLocales()
      expect(locales).toEqual(['en', 'de', 'fr', 'es'])
    })
  })

  describe('getDefaultLocale', () => {
    it('should return a string', () => {
      const defaultLocale = getDefaultLocale()
      expect(typeof defaultLocale).toBe('string')
    })

    it('should return English as the default locale', () => {
      const defaultLocale = getDefaultLocale()
      expect(defaultLocale).toBe('en')
    })

    it('should return a locale that exists in getLocales', () => {
      const defaultLocale = getDefaultLocale()
      const locales = getLocales()
      expect(locales).toContain(defaultLocale)
    })

    it('should return the same locale on multiple calls', () => {
      const locale1 = getDefaultLocale()
      const locale2 = getDefaultLocale()
      expect(locale1).toBe(locale2)
    })
  })

  describe('routing', () => {
    it('should be defined', () => {
      expect(routing).toBeDefined()
    })

    it('should have a locales property', () => {
      expect(routing).toHaveProperty('locales')
    })

    it('should have a defaultLocale property', () => {
      expect(routing).toHaveProperty('defaultLocale')
    })

    it('should have a localePrefix property', () => {
      expect(routing).toHaveProperty('localePrefix')
    })

    it('should have a localeDetection property', () => {
      expect(routing).toHaveProperty('localeDetection')
    })

    it('should have locales matching getLocales()', () => {
      const locales = getLocales()
      expect(routing.locales).toEqual(locales)
    })

    it('should have defaultLocale matching getDefaultLocale()', () => {
      const defaultLocale = getDefaultLocale()
      expect(routing.defaultLocale).toBe(defaultLocale)
    })

    it('should have localePrefix set to "always"', () => {
      expect(routing.localePrefix).toBe('always')
    })

    it('should have localeDetection set to true', () => {
      expect(routing.localeDetection).toBe(true)
    })

    it('should contain all locales from getLocales', () => {
      const locales = getLocales()
      locales.forEach((locale) => {
        expect(routing.locales).toContain(locale)
      })
    })

    it('should have exactly 4 locales in routing config', () => {
      expect(routing.locales).toHaveLength(4)
    })
  })

  describe('config consistency', () => {
    it('should have matching locale counts', () => {
      const locales = getLocales()
      expect(routing.locales).toHaveLength(locales.length)
    })

    it('should have matching default locale', () => {
      const defaultLocale = getDefaultLocale()
      const routingDefault = routing.defaultLocale
      expect(routingDefault).toBe(defaultLocale)
    })

    it('should have all routing locales in getLocales', () => {
      const locales = getLocales()
      routing.locales.forEach((locale) => {
        expect(locales).toContain(locale)
      })
    })
  })
})
