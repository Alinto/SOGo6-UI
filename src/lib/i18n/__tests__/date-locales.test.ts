import { getDateFnsLocale } from '../date-locales'

// Mock the config module
jest.mock('../config', () => ({
  getDefaultLocale: () => 'en',
  getLocales: () => ['en', 'fr', 'de', 'es'],
}))

describe('getDateFnsLocale', () => {
  // Mock console.warn to avoid noise in test output
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should return enUS locale for "en"', () => {
    const locale = getDateFnsLocale('en')
    expect(locale).toBeDefined()
    expect(locale.code).toBe('en-US')
  })

  it('should return fr locale for "fr"', () => {
    const locale = getDateFnsLocale('fr')
    expect(locale).toBeDefined()
    expect(locale.code).toBe('fr')
  })

  it('should return de locale for "de"', () => {
    const locale = getDateFnsLocale('de')
    expect(locale).toBeDefined()
    expect(locale.code).toBe('de')
  })

  it('should return es locale for "es"', () => {
    const locale = getDateFnsLocale('es')
    expect(locale).toBeDefined()
    expect(locale.code).toBe('es')
  })

  it('should return enUS as fallback for unknown locale', () => {
    const locale = getDateFnsLocale('unknown')
    expect(locale).toBeDefined()
    expect(locale.code).toBe('en-US')
    // Verify warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Locale "unknown" not found')
    )
  })

  it('should handle empty string as locale', () => {
    const locale = getDateFnsLocale('')
    expect(locale).toBeDefined()
    expect(locale.code).toBe('en-US')
    // Verify warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Locale "" not found')
    )
  })
})
