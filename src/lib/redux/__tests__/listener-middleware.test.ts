import '@testing-library/jest-dom'

// Mock @reduxjs/toolkit
const mockStartListening = jest.fn()
const mockAddListener = jest.fn()

const mockListenerMiddleware = {
  startListening: {
    withTypes: jest.fn(() => mockStartListening),
  },
}

const mockCreateListenerMiddleware = jest.fn(() => mockListenerMiddleware)

jest.mock('@reduxjs/toolkit', () => ({
  createListenerMiddleware: mockCreateListenerMiddleware,
  addListener: {
    withTypes: jest.fn(() => mockAddListener),
  },
}))

// Mock store types
jest.mock('../store', () => ({
  AppDispatch: {},
  RootState: {},
}))

describe('Listener Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('listenerMiddleware', () => {
    it('should create listener middleware instance', async () => {
      const { listenerMiddleware } = await import('../listener-middleware')

      expect(mockCreateListenerMiddleware).toHaveBeenCalled()
      expect(listenerMiddleware).toBe(mockListenerMiddleware)
    })

    it('should be defined and have required properties', async () => {
      const { listenerMiddleware } = await import('../listener-middleware')

      expect(listenerMiddleware).toBeDefined()
      expect(listenerMiddleware.startListening).toBeDefined()
      expect(typeof listenerMiddleware.startListening.withTypes).toBe(
        'function'
      )
    })
  })

  describe('startAppListening', () => {
    it('should create typed start listening function', async () => {
      const { startAppListening } = await import('../listener-middleware')

      expect(startAppListening).toBe(mockStartListening)
    })

    it('should call startListening.withTypes with proper types', async () => {
      await import('../listener-middleware')

      expect(mockListenerMiddleware.startListening.withTypes).toHaveBeenCalled()
    })

    it('should be defined and be a function', async () => {
      const { startAppListening } = await import('../listener-middleware')

      expect(typeof startAppListening).toBe('function')
    })
  })

  describe('addAppListener', () => {
    it('should create typed add listener function', async () => {
      const { addAppListener } = await import('../listener-middleware')

      expect(addAppListener).toBe(mockAddListener)
    })

    it('should call addListener.withTypes with proper types', async () => {
      const toolkit = require('@reduxjs/toolkit')
      await import('../listener-middleware')

      expect(toolkit.addListener.withTypes).toHaveBeenCalled()
    })

    it('should be defined and be a function', async () => {
      const { addAppListener } = await import('../listener-middleware')

      expect(typeof addAppListener).toBe('function')
    })
  })

  describe('type exports', () => {
    it('should export AppStartListening type', async () => {
      // This test ensures the type export doesn't cause runtime errors
      const module = await import('../listener-middleware')
      expect(module.startAppListening).toBeDefined()
    })

    it('should export AppAddListener type', async () => {
      // This test ensures the type export doesn't cause runtime errors
      const module = await import('../listener-middleware')
      expect(module.addAppListener).toBeDefined()
    })
  })

  describe('integration', () => {
    it('should properly initialize listener middleware system', async () => {
      await expect(import('../listener-middleware')).resolves.toBeDefined()
    })

    it('should export all required functions and types', async () => {
      const module = await import('../listener-middleware')
      const exports = Object.keys(module)

      expect(exports).toContain('listenerMiddleware')
      expect(exports).toContain('startAppListening')
      expect(exports).toContain('addAppListener')
    })

    it('should maintain proper function signatures', async () => {
      const { listenerMiddleware, startAppListening, addAppListener } =
        await import('../listener-middleware')

      expect(typeof listenerMiddleware).toBe('object')
      expect(typeof startAppListening).toBe('function')
      expect(typeof addAppListener).toBe('function')
    })
  })

  describe('middleware configuration', () => {
    it('should create middleware with default configuration', async () => {
      await import('../listener-middleware')

      expect(mockCreateListenerMiddleware).toHaveBeenCalledWith()
    })

    it('should configure typed listeners with store types', async () => {
      await import('../listener-middleware')

      // Verify that the middleware is configured with proper typing
      expect(
        mockListenerMiddleware.startListening.withTypes
      ).toHaveBeenCalledTimes(1)
    })
  })
})
