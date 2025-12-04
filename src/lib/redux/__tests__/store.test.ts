import '@testing-library/jest-dom'

// Mock @reduxjs/toolkit
const mockConfigureStore = jest.fn()
const mockGetDefaultMiddleware = jest.fn(() => ({
  prepend: jest.fn().mockReturnThis(),
  concat: jest.fn().mockReturnThis(),
}))

const mockStore = {
  dispatch: jest.fn(),
  getState: jest.fn(),
  subscribe: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  getReducerMap: jest.fn(),
}

jest.mock('@reduxjs/toolkit', () => ({
  configureStore: jest.fn(() => mockStore),
}))

// Mock dependencies
const mockApiSlice = {
  reducerPath: 'api',
  reducer: jest.fn(),
  middleware: jest.fn(),
}

jest.mock('../api/api-slice', () => ({
  apiSlice: mockApiSlice,
}))

const mockSSEApi = {
  reducerPath: 'sseApi',
  reducer: jest.fn(),
  middleware: jest.fn(),
}

jest.mock('../sse/sse-api', () => ({
  sseApi: mockSSEApi,
}))

const mockListenerMiddleware = {
  middleware: jest.fn(),
}

jest.mock('../listener-middleware', () => ({
  listenerMiddleware: mockListenerMiddleware,
}))

const mockReducerManager = {
  reduce: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  getReducerMap: jest.fn(),
}

const mockCreateReducerManager = jest.fn(() => mockReducerManager)

jest.mock('../reducer-manager', () => ({
  createReducerManager: mockCreateReducerManager,
}))

const mockMailComposeReducer = jest.fn()

jest.mock('@/features/mails/store', () => ({
  mailComposeReducer: mockMailComposeReducer,
}))

describe('Store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('reducerManager', () => {
    it('should create reducer manager with static reducers', async () => {
      await import('../store')

      expect(mockCreateReducerManager).toHaveBeenCalledWith({
        mailCompose: mockMailComposeReducer,
        [mockApiSlice.reducerPath]: mockApiSlice.reducer,
        [mockSSEApi.reducerPath]: mockSSEApi.reducer,
      })
    })

    it('should export reducer manager instance', async () => {
      const { reducerManager } = await import('../store')

      expect(reducerManager).toBe(mockReducerManager)
    })
  })

  describe('makeStore', () => {
    beforeEach(() => {
      jest.resetModules()
    })

    it('should create store with proper configuration', async () => {
      const toolkit = require('@reduxjs/toolkit')
      const { makeStore } = await import('../store')

      makeStore()

      expect(toolkit.configureStore).toHaveBeenCalledWith({
        reducer: mockReducerManager.reduce,
        middleware: expect.any(Function),
      })
    })

    it('should configure middleware correctly', async () => {
      const toolkit = require('@reduxjs/toolkit')
      const { makeStore } = await import('../store')

      makeStore()

      const configCall = toolkit.configureStore.mock.calls[0][0]
      const middlewareFactory = configCall.middleware

      // Mock getDefaultMiddleware
      const mockMiddlewareChain = {
        prepend: jest.fn().mockReturnThis(),
        concat: jest.fn().mockReturnThis(),
      }

      const result = middlewareFactory(jest.fn(() => mockMiddlewareChain))

      expect(mockMiddlewareChain.prepend).toHaveBeenCalledWith(
        mockListenerMiddleware.middleware
      )
      expect(mockMiddlewareChain.concat).toHaveBeenNthCalledWith(
        1,
        mockApiSlice.middleware
      )
      expect(mockMiddlewareChain.concat).toHaveBeenNthCalledWith(
        2,
        mockSSEApi.middleware
      )
    })

    it('should return store with reducer manager methods', async () => {
      const { makeStore } = await import('../store')

      const store = makeStore()

      expect(store.add).toBe(mockReducerManager.add)
      expect(store.remove).toBe(mockReducerManager.remove)
      expect(store.getReducerMap).toBe(mockReducerManager.getReducerMap)
    })

    it('should return a function', async () => {
      const { makeStore } = await import('../store')

      expect(typeof makeStore).toBe('function')
    })

    it('should create new store instance on each call', async () => {
      const { makeStore } = await import('../store')

      const store1 = makeStore()
      const store2 = makeStore()

      // Both should be the same mock object since we're mocking configureStore
      // But the function should be called twice
      const toolkit = require('@reduxjs/toolkit')
      expect(toolkit.configureStore).toHaveBeenCalledTimes(2)
    })
  })

  describe('type exports', () => {
    it('should export AppStore type', async () => {
      // This test ensures the type export doesn't cause runtime errors
      const module = await import('../store')
      expect(module.makeStore).toBeDefined()
    })

    it('should export required functions and types', async () => {
      const module = await import('../store')

      expect(module.makeStore).toBeDefined()
      expect(module.reducerManager).toBeDefined()
      expect(typeof module.makeStore).toBe('function')
    })
  })

  describe('static reducers configuration', () => {
    it('should include mailCompose, api slice, and sse api reducers in static reducers', async () => {
      // Reset modules and reimport to ensure fresh state
      jest.resetModules()

      // Setup mocks before import
      jest.doMock('../api/api-slice', () => ({
        apiSlice: mockApiSlice,
      }))

      jest.doMock('../sse/sse-api', () => ({
        sseApi: mockSSEApi,
      }))

      jest.doMock('../reducer-manager', () => ({
        createReducerManager: mockCreateReducerManager,
      }))

      jest.doMock('@/features/mails/store', () => ({
        mailComposeReducer: mockMailComposeReducer,
      }))

      // Import the module
      await import('../store')

      const expectedStaticReducers = {
        mailCompose: mockMailComposeReducer,
        [mockApiSlice.reducerPath]: mockApiSlice.reducer,
        [mockSSEApi.reducerPath]: mockSSEApi.reducer,
      }

      expect(mockCreateReducerManager).toHaveBeenCalledWith(
        expectedStaticReducers
      )
    })

    it('should handle api slice reducer path correctly', async () => {
      // Test with different reducer path
      const customApiSlice = {
        reducerPath: 'customApi',
        reducer: jest.fn(),
        middleware: jest.fn(),
      }

      jest.doMock('../api/api-slice', () => ({
        apiSlice: customApiSlice,
      }))

      jest.doMock('../sse/sse-api', () => ({
        sseApi: mockSSEApi,
      }))

      jest.doMock('@/features/mails/store', () => ({
        mailComposeReducer: mockMailComposeReducer,
      }))

      // Reset modules to get fresh import
      jest.resetModules()
      await import('../store')

      expect(mockCreateReducerManager).toHaveBeenCalledWith({
        mailCompose: mockMailComposeReducer,
        [customApiSlice.reducerPath]: customApiSlice.reducer,
        [mockSSEApi.reducerPath]: mockSSEApi.reducer,
      })
    })
  })

  describe('store enhancement', () => {
    it('should enhance store with reducer manager methods', async () => {
      const { makeStore } = await import('../store')

      const store = makeStore()

      // Verify that the store has been enhanced with reducer manager methods
      expect(store).toHaveProperty('add')
      expect(store).toHaveProperty('remove')
      expect(store).toHaveProperty('getReducerMap')
      expect(store.add).toBe(mockReducerManager.add)
      expect(store.remove).toBe(mockReducerManager.remove)
      expect(store.getReducerMap).toBe(mockReducerManager.getReducerMap)
    })
  })
})
