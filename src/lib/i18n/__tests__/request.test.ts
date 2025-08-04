import '@testing-library/jest-dom'

// Mock fs module
const mockFs = {
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
}
jest.mock('fs', () => mockFs)

// Mock path module
const mockPath = {
  join: jest.fn((...args) => args.join('/')),
  relative: jest.fn((from, to) => to.replace(from + '/', '')),
}
jest.mock('path', () => mockPath)

// Mock next-intl/server
const mockGetRequestConfig = jest.fn()
jest.mock('next-intl/server', () => ({
  getRequestConfig: mockGetRequestConfig,
}))

// Mock deepmerge
const mockDeepmerge = jest.fn((a, b) => ({ ...a, ...b }))
jest.mock('deepmerge', () => mockDeepmerge)

// Mock middleware routing
const mockRouting = {
  locales: ['en', 'de', 'fr', 'es'],
  defaultLocale: 'en',
}
jest.mock('@/middleware', () => ({
  routing: mockRouting,
}))

describe('request.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()

    // Setup default mock returns
    mockFs.existsSync.mockReturnValue(false) // Default to no files to avoid import issues
    mockFs.readdirSync.mockReturnValue([])
    mockFs.statSync.mockReturnValue({ isDirectory: () => false })
  })

  describe('module exports', () => {
    it('should export createDefaultMessages function', async () => {
      const module = await import('../request')
      expect(typeof module.createDefaultMessages).toBe('function')
    })

    it('should export createMessages function', async () => {
      const module = await import('../request')
      expect(typeof module.createMessages).toBe('function')
    })

    it('should call getRequestConfig during module initialization', async () => {
      await import('../request')
      expect(mockGetRequestConfig).toHaveBeenCalled()
    })
  })

  describe('createDefaultMessages', () => {
    it('should handle non-existent directories', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const { createDefaultMessages } = await import('../request')
      const result = await createDefaultMessages()

      expect(result).toEqual({})
    })

    it('should call fs.existsSync with correct path', async () => {
      const { createDefaultMessages } = await import('../request')
      await createDefaultMessages()

      expect(mockFs.existsSync).toHaveBeenCalledWith('src/messages/en')
    })

    it('should handle empty directories', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([])

      const { createDefaultMessages } = await import('../request')
      const result = await createDefaultMessages()

      expect(result).toEqual({})
    })

    it('should call readdirSync when directory exists', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([])

      const { createDefaultMessages } = await import('../request')
      await createDefaultMessages()

      expect(mockFs.readdirSync).toHaveBeenCalledWith('src/messages/en')
    })
  })

  describe('createMessages', () => {
    it('should handle non-existent locale directories', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const { createMessages } = await import('../request')
      const result = await createMessages('fr')

      expect(result).toEqual({})
    })

    it('should use correct directory path for specified locale', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const { createMessages } = await import('../request')
      await createMessages('de')

      expect(mockFs.existsSync).toHaveBeenCalledWith('src/messages/de')
    })

    it('should handle different locale parameters', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const { createMessages } = await import('../request')

      await createMessages('de')
      expect(mockFs.existsSync).toHaveBeenCalledWith('src/messages/de')

      await createMessages('fr')
      expect(mockFs.existsSync).toHaveBeenCalledWith('src/messages/fr')
    })

    it('should call readdirSync when locale directory exists', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([])

      const { createMessages } = await import('../request')
      await createMessages('fr')

      expect(mockFs.readdirSync).toHaveBeenCalledWith('src/messages/fr')
    })
  })

  describe('getRequestConfig behavior', () => {
    it('should provide configuration function to getRequestConfig', async () => {
      await import('../request')

      expect(mockGetRequestConfig).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should handle locale validation in configuration', async () => {
      let configFunction: any
      mockGetRequestConfig.mockImplementation((fn) => {
        configFunction = fn
        return fn
      })

      await import('../request')

      // Valid locale
      let result = await configFunction({
        requestLocale: Promise.resolve('de'),
      })
      expect(result.locale).toBe('de')

      // Invalid locale should fallback to default
      result = await configFunction({
        requestLocale: Promise.resolve('invalid'),
      })
      expect(result.locale).toBe('en')

      // Null locale should fallback to default
      result = await configFunction({
        requestLocale: Promise.resolve(null),
      })
      expect(result.locale).toBe('en')
    })

    it('should call deepmerge to merge messages', async () => {
      let configFunction: any
      mockGetRequestConfig.mockImplementation((fn) => {
        configFunction = fn
        return fn
      })

      mockDeepmerge.mockReturnValue({ merged: 'messages' })

      await import('../request')

      const result = await configFunction({
        requestLocale: Promise.resolve('fr'),
      })

      expect(mockDeepmerge).toHaveBeenCalled()
      expect(result.messages).toEqual({ merged: 'messages' })
    })

    it('should handle all supported locales from routing', async () => {
      let configFunction: any
      mockGetRequestConfig.mockImplementation((fn) => {
        configFunction = fn
        return fn
      })

      await import('../request')

      // Test each locale from routing configuration
      for (const locale of mockRouting.locales) {
        const result = await configFunction({
          requestLocale: Promise.resolve(locale),
        })
        expect(result.locale).toBe(locale)
      }
    })
  })

  describe('file system operations', () => {
    it('should handle empty directories without errors', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([])

      const { createDefaultMessages } = await import('../request')
      const result = await createDefaultMessages()

      expect(result).toEqual({})
      expect(mockFs.readdirSync).toHaveBeenCalled()
    })

    it('should handle non-existent directories gracefully', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const { createDefaultMessages } = await import('../request')
      const result = await createDefaultMessages()

      expect(result).toEqual({})
      expect(mockFs.existsSync).toHaveBeenCalledWith('src/messages/en')
    })
  })

  describe('routing integration', () => {
    it('should use default locale from routing configuration', async () => {
      const { createDefaultMessages } = await import('../request')
      await createDefaultMessages()

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        `src/messages/${mockRouting.defaultLocale}`
      )
    })

    it('should validate locales against routing.locales array', async () => {
      let configFunction: any
      mockGetRequestConfig.mockImplementation((fn) => {
        configFunction = fn
        return fn
      })

      await import('../request')

      // Test that valid locales are accepted
      const validLocale = mockRouting.locales[1] // 'de'
      const result1 = await configFunction({
        requestLocale: Promise.resolve(validLocale),
      })
      expect(result1.locale).toBe(validLocale)

      // Test that invalid locales fallback to default
      const result2 = await configFunction({
        requestLocale: Promise.resolve('invalid-locale'),
      })
      expect(result2.locale).toBe(mockRouting.defaultLocale)
    })
  })
})
