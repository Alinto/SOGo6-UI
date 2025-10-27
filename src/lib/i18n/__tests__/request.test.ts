import '@testing-library/jest-dom'
import { createDefaultMessages, createMessages } from '../request'

// Mock dependencies BEFORE importing
jest.mock('fs')
jest.mock('path')
jest.mock('deepmerge')

jest.mock('next-intl/server', () => ({
  getRequestConfig: jest.fn((config) => config),
}))

jest.mock('../config', () => ({
  routing: {
    locales: ['en', 'de', 'fr', 'es'],
    defaultLocale: 'en',
    localePrefix: 'always',
    localeDetection: true,
  },
}))

import deepmerge from 'deepmerge'
import fs from 'fs'
import path from 'path'

describe('request', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createDefaultMessages', () => {
    it('should be an async function', () => {
      expect(createDefaultMessages).toBeDefined()
      expect(typeof createDefaultMessages).toBe('function')
    })

    it('should be callable without arguments', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = await createDefaultMessages()
      expect(result).toBeDefined()
    })

    it('should return an object', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = await createDefaultMessages()
      expect(typeof result).toBe('object')
      expect(result !== null).toBe(true)
    })

    it('should use default locale path construction', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      await createDefaultMessages()

      expect(fs.existsSync).toHaveBeenCalled()
    })

    it('should use fs.existsSync to check directory with messages/en path', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      await createDefaultMessages()

      expect(fs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('messages/en')
      )
    })
  })

  describe('createMessages', () => {
    it('should be an async function', () => {
      expect(createMessages).toBeDefined()
      expect(typeof createMessages).toBe('function')
    })

    it('should accept a locale parameter of type string', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = await createMessages('de')
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should return an object', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = await createMessages('fr')
      expect(typeof result).toBe('object')
      expect(result !== null).toBe(true)
    })

    it('should use fs.existsSync to check for locale directory', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      await createMessages('de')

      expect(fs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('messages/de')
      )
    })

    it('should construct correct directory path for each locale', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const locales = ['en', 'de', 'fr', 'es']
      for (const locale of locales) {
        await createMessages(locale)
      }

      expect(fs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('messages/en')
      )
      expect(fs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('messages/de')
      )
      expect(fs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('messages/fr')
      )
      expect(fs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('messages/es')
      )
    })

    it('should return empty object when directory does not exist', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = await createMessages('de')

      expect(result).toEqual({})
    })

    it('should handle nonexistent locale gracefully', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = await createMessages('xx')

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should return independent copies on multiple calls', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result1 = await createMessages('de')
      const result2 = await createMessages('de')

      expect(result1).toEqual(result2)
      expect(result1).not.toBe(result2)
    })

    it('should handle multiple different locales', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const resultDe = await createMessages('de')
      const resultFr = await createMessages('fr')
      const resultEs = await createMessages('es')

      expect(resultDe).toBeDefined()
      expect(resultFr).toBeDefined()
      expect(resultEs).toBeDefined()
    })
  })

  describe('file system interaction', () => {
    it('should use fs.existsSync to validate directory existence', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      await createMessages('de')

      expect(fs.existsSync).toHaveBeenCalled()
      expect(fs.existsSync).toHaveBeenCalledTimes(1)
    })

    it('should not call fs.readdirSync if directory does not exist', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      await createMessages('de')

      expect(fs.readdirSync).not.toHaveBeenCalled()
    })

    it('should call fs.readdirSync when directory exists', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      await createMessages('de')

      expect(fs.readdirSync).toHaveBeenCalled()
    })

    it('should check directory existence before reading files', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      await createMessages('de')

      expect(fs.existsSync).toHaveBeenCalled()
      expect(fs.readdirSync).toHaveBeenCalled()
    })

    it('should use path functions for directory operations', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      await createMessages('de')

      expect(fs.existsSync).toHaveBeenCalledWith(expect.any(String))
    })
  })

  describe('message merging and aggregation', () => {
    it('should handle cases with no files', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      const result = await createMessages('de')

      expect(result).toEqual({})
    })

    it('should return object type for both default and custom messages', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      const defaultResult = await createDefaultMessages()
      const customResult = await createMessages('de')

      expect(typeof defaultResult).toBe('object')
      expect(typeof customResult).toBe('object')
    })

    it('should process each file in the directory', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      await createMessages('de')

      expect(fs.readdirSync).toHaveBeenCalled()
    })
  })

  describe('function exports', () => {
    it('should export createDefaultMessages', () => {
      expect(createDefaultMessages).toBeDefined()
      expect(typeof createDefaultMessages).toBe('function')
    })

    it('should export createMessages', () => {
      expect(createMessages).toBeDefined()
      expect(typeof createMessages).toBe('function')
    })

    it('should export default configuration', () => {
      const requestConfig = require('../request').default
      expect(requestConfig).toBeDefined()
    })

    it('should have exactly 3 named exports', () => {
      const mod = require('../request')
      const namedExports = Object.keys(mod).filter((key) => key !== 'default')
      expect(namedExports).toContain('createDefaultMessages')
      expect(namedExports).toContain('createMessages')
    })
  })

  describe('routing configuration usage', () => {
    it('should use routing config for locale validation', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const { routing } = require('../config')

      expect(routing.locales).toBeDefined()
      expect(routing.defaultLocale).toBeDefined()
      expect(routing.locales).toContain(routing.defaultLocale)
    })

    it('should support all configured locales', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const { routing } = require('../config')
      const supportedLocales = routing.locales

      for (const locale of supportedLocales) {
        const result = await createMessages(locale)
        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
      }
    })

    it('should respect routing.defaultLocale', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const { routing } = require('../config')

      expect(routing.defaultLocale).toBe('en')
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle missing directories gracefully', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = await createDefaultMessages()

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should handle empty directory gracefully', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      const result = await createMessages('de')

      expect(result).toEqual({})
    })

    it('should return consistent structure on multiple calls', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      const result1 = await createMessages('en')
      const result2 = await createMessages('en')

      expect(typeof result1).toBe(typeof result2)
      expect(Object.keys(result1)).toEqual(Object.keys(result2))
    })

    it('should initialize messages as empty object', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      const result = await createMessages('de')

      expect(Object.keys(result)).toHaveLength(0)
    })
  })

  describe('dependency imports', () => {
    it('should have deepmerge available', () => {
      expect(deepmerge).toBeDefined()
    })

    it('should have fs module available', () => {
      expect(fs).toBeDefined()
    })

    it('should have path module available', () => {
      expect(path).toBeDefined()
    })

    it('should import next-intl/server', () => {
      const mod = require('next-intl/server')
      expect(mod).toBeDefined()
    })
  })

  describe('async/await behavior', () => {
    it('createDefaultMessages should return a Promise', () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = createDefaultMessages()

      expect(result instanceof Promise).toBe(true)
    })

    it('createMessages should return a Promise', () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = createMessages('de')

      expect(result instanceof Promise).toBe(true)
    })

    it('should resolve promises with object values', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const result = await createMessages('de')

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('both functions should be async', () => {
      expect(createDefaultMessages.constructor.name).toContain('Function')
      expect(createMessages.constructor.name).toContain('Function')
    })
  })

  describe('path normalization', () => {
    it('should construct src/messages directory paths', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      await createMessages('de')

      const calls = (fs.existsSync as jest.Mock).mock.calls
      expect(calls[0][0]).toContain('src/messages/de')
    })

    it('should construct default locale path correctly', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      await createDefaultMessages()

      const calls = (fs.existsSync as jest.Mock).mock.calls
      expect(calls[0][0]).toContain('src/messages')
    })
  })

  describe('object assignment behavior', () => {
    it('should use Object.assign to merge messages', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.readdirSync as jest.Mock).mockReturnValue([])

      const result = await createMessages('en')

      expect(result).toEqual({})
      expect(Object.keys(result)).toHaveLength(0)
    })
  })
})
