import '@testing-library/jest-dom'

// Mock next-intl/navigation
const mockCreateNavigation = jest.fn()
jest.mock('next-intl/navigation', () => ({
  createNavigation: mockCreateNavigation,
}))

// Mock middleware routing
const mockRouting = {
  locales: ['en', 'de', 'fr', 'es'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true,
}

jest.mock('@/middleware', () => ({
  routing: mockRouting,
}))

describe('navigation', () => {
  const mockNavigationObjects = {
    Link: jest.fn(),
    redirect: jest.fn(),
    usePathname: jest.fn(),
    useRouter: jest.fn(),
    getPathname: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    mockCreateNavigation.mockReturnValue(mockNavigationObjects)
  })

  it('should call createNavigation with routing configuration', () => {
    // Import the navigation module to trigger createNavigation
    require('../navigation')

    expect(mockCreateNavigation).toHaveBeenCalledWith(mockRouting)
  })

  it('should export all navigation functions from createNavigation', () => {
    const navigation = require('../navigation')

    expect(navigation.Link).toBe(mockNavigationObjects.Link)
    expect(navigation.redirect).toBe(mockNavigationObjects.redirect)
    expect(navigation.usePathname).toBe(mockNavigationObjects.usePathname)
    expect(navigation.useRouter).toBe(mockNavigationObjects.useRouter)
    expect(navigation.getPathname).toBe(mockNavigationObjects.getPathname)
  })

  it('should provide Link component', () => {
    const navigation = require('../navigation')

    expect(navigation.Link).toBeDefined()
    expect(typeof navigation.Link).toBe('function')
  })

  it('should provide redirect function', () => {
    const navigation = require('../navigation')

    expect(navigation.redirect).toBeDefined()
    expect(typeof navigation.redirect).toBe('function')
  })

  it('should provide usePathname hook', () => {
    const navigation = require('../navigation')

    expect(navigation.usePathname).toBeDefined()
    expect(typeof navigation.usePathname).toBe('function')
  })

  it('should provide useRouter hook', () => {
    const navigation = require('../navigation')

    expect(navigation.useRouter).toBeDefined()
    expect(typeof navigation.useRouter).toBe('function')
  })

  it('should provide getPathname function', () => {
    const navigation = require('../navigation')

    expect(navigation.getPathname).toBeDefined()
    expect(typeof navigation.getPathname).toBe('function')
  })

  it('should handle routing configuration with correct structure', () => {
    require('../navigation')

    const passedRouting = mockCreateNavigation.mock.calls[0][0]
    expect(passedRouting).toHaveProperty('locales')
    expect(passedRouting).toHaveProperty('defaultLocale')
    expect(passedRouting.locales).toContain('en')
    expect(passedRouting.defaultLocale).toBe('en')
  })
})
