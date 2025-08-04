import '@testing-library/jest-dom'

// Mock next-intl/routing
const mockDefineRouting = jest.fn()
jest.mock('next-intl/routing', () => ({
  defineRouting: mockDefineRouting,
}))

// Mock middleware functions
const mockGetLocales = jest.fn(() => ['en', 'de', 'fr', 'es'])
const mockGetDefaultLocale = jest.fn(() => 'en')

jest.mock('@/middleware', () => ({
  getDefaultLocale: mockGetDefaultLocale,
  getLocales: mockGetLocales,
}))

describe('routing', () => {
  const mockRoutingConfig = {
    locales: ['en', 'de', 'fr', 'es'],
    defaultLocale: 'en',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    mockDefineRouting.mockReturnValue(mockRoutingConfig)
  })

  it('should call defineRouting with correct configuration', () => {
    require('../routing')

    expect(mockDefineRouting).toHaveBeenCalledWith({
      locales: ['en', 'de', 'fr', 'es'],
      defaultLocale: 'en',
    })
  })

  it('should call getLocales to get available locales', () => {
    require('../routing')

    expect(mockGetLocales).toHaveBeenCalled()
  })

  it('should call getDefaultLocale to get the default locale', () => {
    require('../routing')

    expect(mockGetDefaultLocale).toHaveBeenCalled()
  })

  it('should export the routing configuration as default', () => {
    const routing = require('../routing').default

    expect(routing).toBe(mockRoutingConfig)
  })

  it('should handle different locale configurations', () => {
    // Test with different locale configurations
    mockGetLocales.mockReturnValueOnce(['en', 'fr'])
    mockGetDefaultLocale.mockReturnValueOnce('fr')

    // Clear the module cache to re-import with new mock values
    jest.resetModules()

    require('../routing')

    expect(mockDefineRouting).toHaveBeenCalledWith({
      locales: ['en', 'fr'],
      defaultLocale: 'fr',
    })
  })

  it('should pass locales array with multiple languages', () => {
    require('../routing')

    const config = mockDefineRouting.mock.calls[0][0]
    expect(Array.isArray(config.locales)).toBe(true)
    expect(config.locales.length).toBeGreaterThan(1)
    expect(config.locales).toContain('en')
  })

  it('should ensure default locale is included in locales array', () => {
    require('../routing')

    const config = mockDefineRouting.mock.calls[0][0]
    expect(config.locales).toContain(config.defaultLocale)
  })

  it('should handle empty locale arrays gracefully', () => {
    mockGetLocales.mockReturnValueOnce([])
    mockGetDefaultLocale.mockReturnValueOnce('en')

    jest.resetModules()
    require('../routing')

    expect(mockDefineRouting).toHaveBeenCalledWith({
      locales: [],
      defaultLocale: 'en',
    })
  })

  it('should handle single locale configuration', () => {
    mockGetLocales.mockReturnValueOnce(['en'])
    mockGetDefaultLocale.mockReturnValueOnce('en')

    jest.resetModules()
    require('../routing')

    expect(mockDefineRouting).toHaveBeenCalledWith({
      locales: ['en'],
      defaultLocale: 'en',
    })
  })
})
