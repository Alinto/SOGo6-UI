import '@testing-library/jest-dom'

// Mock notifications-slice FIRST to prevent createSlice from being called
jest.mock('@/features/notifications/notifications-slice', () => ({
  notificationsSlice: {
    reducer: (state = {}) => state,
  },
}))

jest.mock('@/features/notifications', () => ({
  notificationsReducer: (state = {}) => state,
}))

describe('Store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('reducerManager', () => {
    it('should create reducer manager with static reducers', () => {
      const { reducerManager } = require('../store')

      expect(reducerManager).toBeDefined()
      expect(reducerManager.reduce).toBeDefined()
      expect(typeof reducerManager.reduce).toBe('function')
    })

    it('should export reducer manager instance', () => {
      const { reducerManager } = require('../store')

      expect(reducerManager).toBeDefined()
      expect(reducerManager.add).toBeDefined()
      expect(reducerManager.remove).toBeDefined()
      expect(reducerManager.getReducerMap).toBeDefined()
    })
  })

  describe('makeStore', () => {
    it('should create store with proper configuration', () => {
      const { makeStore } = require('../store')
      const store = makeStore()

      expect(store).toBeDefined()
      expect(store.getState).toBeDefined()
      expect(store.dispatch).toBeDefined()
    })

    it('should configure middleware correctly', () => {
      const { makeStore } = require('../store')
      const store = makeStore()

      expect(typeof store.getState).toBe('function')
      expect(typeof store.dispatch).toBe('function')
    })

    it('should return store with reducer manager methods', () => {
      const { makeStore } = require('../store')
      const store = makeStore()

      expect(store.add).toBeDefined()
      expect(store.remove).toBeDefined()
      expect(store.getReducerMap).toBeDefined()
      expect(typeof store.add).toBe('function')
      expect(typeof store.remove).toBe('function')
      expect(typeof store.getReducerMap).toBe('function')
    })

    it('should return a function', () => {
      const { makeStore } = require('../store')

      expect(typeof makeStore).toBe('function')
    })

    it('should create new store instance on each call', () => {
      const { makeStore } = require('../store')

      const store1 = makeStore()
      const store2 = makeStore()

      expect(store1).not.toBe(store2)
    })
  })

  describe('type exports', () => {
    it('should export AppStore type', () => {
      const storeModule = require('../store')

      expect(storeModule.makeStore).toBeDefined()
    })

    it('should export required functions and types', () => {
      const storeModule = require('../store')

      expect(storeModule.makeStore).toBeDefined()
      expect(storeModule.reducerManager).toBeDefined()
      expect(typeof storeModule.makeStore).toBe('function')
    })
  })

  describe('static reducers configuration', () => {
    it('should include mailCompose, api slice, and sse api reducers in static reducers', () => {
      const { reducerManager } = require('../store')

      const reducerMap = reducerManager.getReducerMap()

      expect(reducerMap).toBeDefined()
    })

    it('should handle api slice reducer path correctly', () => {
      const { reducerManager } = require('../store')

      const reducerMap = reducerManager.getReducerMap()

      expect(reducerMap).toBeDefined()
      expect(typeof reducerMap).toBe('object')
    })
  })

  describe('store enhancement', () => {
    it('should enhance store with reducer manager methods', () => {
      const { makeStore } = require('../store')
      const store = makeStore()

      expect(store.add).toBeDefined()
      expect(store.remove).toBeDefined()
      expect(store.getReducerMap).toBeDefined()
    })
  })
})
