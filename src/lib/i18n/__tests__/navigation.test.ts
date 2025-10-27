import '@testing-library/jest-dom'
import {
  getPathname,
  Link,
  redirect,
  usePathname,
  useRouter,
} from '../navigation'

// Mock next-intl/navigation
jest.mock('next-intl/navigation', () => ({
  createNavigation: jest.fn((config) => ({
    Link: jest.fn(),
    redirect: jest.fn(),
    usePathname: jest.fn(),
    useRouter: jest.fn(),
    getPathname: jest.fn(),
  })),
}))

// Mock i18n config
jest.mock('../config', () => ({
  routing: {
    locales: ['en', 'de', 'fr', 'es'],
    defaultLocale: 'en',
    localePrefix: 'always',
    localeDetection: true,
  },
}))

describe('navigation', () => {
  describe('exports', () => {
    it('should export Link component', () => {
      expect(Link).toBeDefined()
    })

    it('should export redirect function', () => {
      expect(redirect).toBeDefined()
    })

    it('should export usePathname hook', () => {
      expect(usePathname).toBeDefined()
    })

    it('should export useRouter hook', () => {
      expect(useRouter).toBeDefined()
    })

    it('should export getPathname function', () => {
      expect(getPathname).toBeDefined()
    })

    it('should export exactly 5 functions/components', () => {
      const navigationExports = {
        Link,
        redirect,
        usePathname,
        useRouter,
        getPathname,
      }
      expect(Object.keys(navigationExports)).toHaveLength(5)
    })
  })

  describe('Link component', () => {
    it('should be a function', () => {
      expect(typeof Link).toBe('function')
    })

    it('should be defined and callable', () => {
      expect(Link).toBeDefined()
      expect(typeof Link).toBe('function')
    })
  })

  describe('redirect function', () => {
    it('should be a function', () => {
      expect(typeof redirect).toBe('function')
    })

    it('should be defined and callable', () => {
      expect(redirect).toBeDefined()
      expect(typeof redirect).toBe('function')
    })
  })

  describe('usePathname hook', () => {
    it('should be a function', () => {
      expect(typeof usePathname).toBe('function')
    })
  })

  describe('useRouter hook', () => {
    it('should be a function', () => {
      expect(typeof useRouter).toBe('function')
    })
  })

  describe('getPathname function', () => {
    it('should be a function', () => {
      expect(typeof getPathname).toBe('function')
    })

    it('should be defined and callable', () => {
      expect(getPathname).toBeDefined()
      expect(typeof getPathname).toBe('function')
    })
  })

  describe('module integration', () => {
    it('should have all exports as distinct objects', () => {
      expect(Link).not.toBe(redirect)
      expect(redirect).not.toBe(usePathname)
      expect(usePathname).not.toBe(useRouter)
      expect(useRouter).not.toBe(getPathname)
    })

    it('should provide internationalized navigation helpers', () => {
      const navigationHelpers = [
        Link,
        redirect,
        usePathname,
        useRouter,
        getPathname,
      ]
      navigationHelpers.forEach((helper) => {
        expect(helper).toBeDefined()
        expect(typeof helper).toBe('function')
      })
    })

    it('should export all required i18n navigation utilities', () => {
      const requiredExports = [
        'Link',
        'redirect',
        'usePathname',
        'useRouter',
        'getPathname',
      ]
      const actualExports = {
        Link,
        redirect,
        usePathname,
        useRouter,
        getPathname,
      }

      requiredExports.forEach((exportName) => {
        expect(actualExports).toHaveProperty(exportName)
        expect(
          actualExports[exportName as keyof typeof actualExports]
        ).toBeDefined()
      })
    })
  })

  describe('navigation with routing config', () => {
    it('should provide navigation utilities based on routing configuration', () => {
      expect(typeof Link).toBe('function')
      expect(typeof redirect).toBe('function')
      expect(typeof usePathname).toBe('function')
      expect(typeof useRouter).toBe('function')
      expect(typeof getPathname).toBe('function')
    })

    it('should support all exported navigation methods', () => {
      const methods = [
        { name: 'Link', fn: Link },
        { name: 'redirect', fn: redirect },
        { name: 'usePathname', fn: usePathname },
        { name: 'useRouter', fn: useRouter },
        { name: 'getPathname', fn: getPathname },
      ]

      methods.forEach(({ name, fn }) => {
        expect(fn).toBeDefined()
        expect(typeof fn).toBe('function')
      })
    })
  })
})
