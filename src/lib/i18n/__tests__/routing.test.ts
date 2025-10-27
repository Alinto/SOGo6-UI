import '@testing-library/jest-dom'
import routing from '../routing'

// Mock next-intl/routing
jest.mock('next-intl/routing', () => ({
  defineRouting: jest.fn((config) => config),
}))

// Mock i18n config
jest.mock('../config', () => ({
  getLocales: jest.fn(() => ['en', 'de', 'fr', 'es']),
  getDefaultLocale: jest.fn(() => 'en'),
}))

describe('routing', () => {
  describe('export', () => {
    it('should export a routing object', () => {
      expect(routing).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof routing).toBe('object')
    })

    it('should not be null', () => {
      expect(routing).not.toBeNull()
    })
  })

  describe('routing configuration', () => {
    it('should have locales property', () => {
      expect(routing).toHaveProperty('locales')
    })

    it('should have defaultLocale property', () => {
      expect(routing).toHaveProperty('defaultLocale')
    })

    it('should have exactly 2 main properties', () => {
      const routingKeys = Object.keys(routing)
      expect(routingKeys).toHaveLength(2)
    })

    it('should have locales as an array', () => {
      expect(Array.isArray(routing.locales)).toBe(true)
    })

    it('should have defaultLocale as a string', () => {
      expect(typeof routing.defaultLocale).toBe('string')
    })
  })

  describe('locales configuration', () => {
    it('should include English locale', () => {
      expect(routing.locales).toContain('en')
    })

    it('should include German locale', () => {
      expect(routing.locales).toContain('de')
    })

    it('should include French locale', () => {
      expect(routing.locales).toContain('fr')
    })

    it('should include Spanish locale', () => {
      expect(routing.locales).toContain('es')
    })

    it('should have exactly 4 locales', () => {
      expect(routing.locales).toHaveLength(4)
    })

    it('should have locales in the expected order', () => {
      expect(routing.locales).toEqual(['en', 'de', 'fr', 'es'])
    })

    it('should not have duplicate locales', () => {
      const uniqueLocales = new Set(routing.locales)
      expect(uniqueLocales.size).toBe(routing.locales.length)
    })
  })

  describe('default locale configuration', () => {
    it('should set default locale to English', () => {
      expect(routing.defaultLocale).toBe('en')
    })

    it('should have a default locale that is in the locales array', () => {
      expect(routing.locales).toContain(routing.defaultLocale)
    })

    it('should be the first locale in the array', () => {
      expect(routing.defaultLocale).toBe(routing.locales[0])
    })

    it('should be a valid locale string', () => {
      expect(typeof routing.defaultLocale).toBe('string')
      expect(routing.defaultLocale.length).toBeGreaterThan(0)
    })
  })

  describe('routing consistency', () => {
    it('should have locales that match configuration', () => {
      const expectedLocales = ['en', 'de', 'fr', 'es']
      expect(routing.locales).toEqual(expectedLocales)
    })

    it('should have a valid default locale', () => {
      expect(routing.defaultLocale).toBe('en')
      expect(routing.locales).toContain(routing.defaultLocale)
    })

    it('should be properly formatted for next-intl routing', () => {
      expect(routing).toHaveProperty('locales')
      expect(routing).toHaveProperty('defaultLocale')
      expect(Array.isArray(routing.locales)).toBe(true)
      expect(typeof routing.defaultLocale).toBe('string')
    })

    it('should provide all required routing properties', () => {
      const requiredProperties = ['locales', 'defaultLocale']
      requiredProperties.forEach((prop) => {
        expect(routing).toHaveProperty(prop)
      })
    })
  })

  describe('routing usage', () => {
    it('should be suitable for next-intl configuration', () => {
      expect(routing.locales).toBeDefined()
      expect(routing.defaultLocale).toBeDefined()
      expect(routing.locales.length).toBeGreaterThan(0)
    })

    it('should support locale validation', () => {
      const testLocales = ['en', 'de', 'fr', 'es']
      testLocales.forEach((locale) => {
        expect(routing.locales).toContain(locale)
      })
    })

    it('should have a consistent locale structure', () => {
      routing.locales.forEach((locale) => {
        expect(typeof locale).toBe('string')
        expect(locale.length).toBeGreaterThan(0)
      })
    })
  })

  describe('routing immutability', () => {
    it('should have locales that are consistent across accesses', () => {
      const firstAccess = [...routing.locales]
      const secondAccess = [...routing.locales]
      expect(firstAccess).toEqual(secondAccess)
    })

    it('should have a default locale that is consistent across accesses', () => {
      const firstAccess = routing.defaultLocale
      const secondAccess = routing.defaultLocale
      expect(firstAccess).toBe(secondAccess)
    })
  })
})
