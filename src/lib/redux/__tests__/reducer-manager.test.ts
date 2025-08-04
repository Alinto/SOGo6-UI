import '@testing-library/jest-dom'
import { createReducerManager } from '../reducer-manager'

// Mock @reduxjs/toolkit
const mockCombineReducers = jest.fn()

jest.mock('@reduxjs/toolkit', () => ({
  combineReducers: jest.fn((reducers) => {
    mockCombineReducers(reducers)
    return (state: any, action: any) => ({ ...state, type: action.type })
  }),
}))

describe('Reducer Manager', () => {
  let reducerManager: any
  const mockReducer1 = jest.fn((state = {}, action) => ({
    ...state,
    action: action.type,
  }))
  const mockReducer2 = jest.fn((state = {}, action) => ({
    ...state,
    action: action.type,
  }))

  beforeEach(() => {
    jest.clearAllMocks()
    const initialReducers = {
      feature1: mockReducer1,
    }
    reducerManager = createReducerManager(initialReducers)
  })

  describe('createReducerManager', () => {
    it('should create a reducer manager with initial reducers', () => {
      const initialReducers = {
        auth: mockReducer1,
        ui: mockReducer2,
      }
      const manager = createReducerManager(initialReducers)

      expect(manager).toBeDefined()
      expect(typeof manager.getReducerMap).toBe('function')
      expect(typeof manager.reduce).toBe('function')
      expect(typeof manager.add).toBe('function')
      expect(typeof manager.remove).toBe('function')
    })

    it('should initialize with empty reducers map', () => {
      const manager = createReducerManager({})
      const reducerMap = manager.getReducerMap()

      expect(reducerMap).toEqual({})
    })

    it('should call combineReducers with initial reducers', () => {
      const initialReducers = { test: mockReducer1 }
      createReducerManager(initialReducers)

      expect(mockCombineReducers).toHaveBeenCalledWith(initialReducers)
    })
  })

  describe('getReducerMap', () => {
    it('should return current reducer map', () => {
      const reducerMap = reducerManager.getReducerMap()

      expect(reducerMap).toEqual({ feature1: mockReducer1 })
    })

    it('should return updated map after adding reducers', () => {
      reducerManager.add('feature2', mockReducer2)
      const reducerMap = reducerManager.getReducerMap()

      expect(reducerMap).toEqual({
        feature1: mockReducer1,
        feature2: mockReducer2,
      })
    })

    it('should return updated map after removing reducers', () => {
      reducerManager.add('feature2', mockReducer2)
      reducerManager.remove('feature1')
      const reducerMap = reducerManager.getReducerMap()

      expect(reducerMap).toEqual({ feature2: mockReducer2 })
    })
  })

  describe('add', () => {
    it('should add new reducer to the map', () => {
      reducerManager.add('feature2', mockReducer2)
      const reducerMap = reducerManager.getReducerMap()

      expect(reducerMap.feature2).toBe(mockReducer2)
    })

    it('should call combineReducers when adding reducer', () => {
      const initialCallCount = mockCombineReducers.mock.calls.length
      reducerManager.add('feature2', mockReducer2)

      expect(mockCombineReducers).toHaveBeenCalledTimes(initialCallCount + 1)
    })

    it('should not add reducer if key is empty', () => {
      const initialMap = { ...reducerManager.getReducerMap() }
      reducerManager.add('', mockReducer2)

      expect(reducerManager.getReducerMap()).toEqual(initialMap)
    })

    it('should not add reducer if key already exists', () => {
      const initialMap = { ...reducerManager.getReducerMap() }
      reducerManager.add('feature1', mockReducer2) // Same key

      expect(reducerManager.getReducerMap()).toEqual(initialMap)
      expect(reducerManager.getReducerMap().feature1).toBe(mockReducer1) // Original reducer
    })

    it('should handle null/undefined keys gracefully', () => {
      const initialMap = { ...reducerManager.getReducerMap() }

      reducerManager.add(null, mockReducer2)
      reducerManager.add(undefined, mockReducer2)

      expect(reducerManager.getReducerMap()).toEqual(initialMap)
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      reducerManager.add('feature2', mockReducer2)
    })

    it('should remove reducer from the map', () => {
      reducerManager.remove('feature2')
      const reducerMap = reducerManager.getReducerMap()

      expect(reducerMap.feature2).toBeUndefined()
      expect(reducerMap).toEqual({ feature1: mockReducer1 })
    })

    it('should call combineReducers when removing reducer', () => {
      const initialCallCount = mockCombineReducers.mock.calls.length
      reducerManager.remove('feature2')

      expect(mockCombineReducers).toHaveBeenCalledTimes(initialCallCount + 1)
    })

    it('should not remove reducer if key is empty', () => {
      const initialMap = { ...reducerManager.getReducerMap() }
      reducerManager.remove('')

      expect(reducerManager.getReducerMap()).toEqual(initialMap)
    })

    it('should not remove reducer if key does not exist', () => {
      const initialMap = { ...reducerManager.getReducerMap() }
      reducerManager.remove('nonexistent')

      expect(reducerManager.getReducerMap()).toEqual(initialMap)
    })

    it('should handle null/undefined keys gracefully', () => {
      const initialMap = { ...reducerManager.getReducerMap() }

      reducerManager.remove(null)
      reducerManager.remove(undefined)

      expect(reducerManager.getReducerMap()).toEqual(initialMap)
    })
  })

  describe('reduce', () => {
    it('should call the combined reducer', () => {
      const state = { existing: 'state' }
      const action = { type: 'TEST_ACTION' }

      const result = reducerManager.reduce(state, action)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should handle state cleanup for removed reducers', () => {
      // Add a reducer and create state
      reducerManager.add('feature2', mockReducer2)
      let state = {
        feature1: { data: 'test1' },
        feature2: { data: 'test2' },
        feature3: { data: 'test3' },
      }

      // Remove the reducer
      reducerManager.remove('feature2')

      // Call reduce - should clean up the removed reducer's state
      const action = { type: 'TEST_ACTION' }
      const newState = reducerManager.reduce(state, action)

      expect(newState.feature2).toBeUndefined()
      expect(newState.feature1).toBeDefined()
      expect(newState.feature3).toBeDefined()
    })

    it('should handle multiple removals in sequence', () => {
      reducerManager.add('feature2', mockReducer2)
      reducerManager.add('feature3', mockReducer1)

      let state = {
        feature1: { data: 'test1' },
        feature2: { data: 'test2' },
        feature3: { data: 'test3' },
      }

      // Remove multiple reducers
      reducerManager.remove('feature2')
      reducerManager.remove('feature3')

      // Call reduce once - should clean up both removed reducers
      const action = { type: 'TEST_ACTION' }
      const newState = reducerManager.reduce(state, action)

      expect(newState.feature2).toBeUndefined()
      expect(newState.feature3).toBeUndefined()
      expect(newState.feature1).toBeDefined()
    })

    it('should not modify state if no removals are pending', () => {
      const state = { feature1: { data: 'test' } }
      const action = { type: 'TEST_ACTION' }

      const newState = reducerManager.reduce(state, action)

      // Should return new state from combined reducer, not the exact same object
      expect(newState).toBeDefined()
    })
  })

  describe('dynamic reducer management', () => {
    it('should support adding and removing reducers dynamically', () => {
      // Start with one reducer
      expect(Object.keys(reducerManager.getReducerMap())).toHaveLength(1)

      // Add more reducers
      reducerManager.add('auth', mockReducer2)
      reducerManager.add('ui', mockReducer1)
      expect(Object.keys(reducerManager.getReducerMap())).toHaveLength(3)

      // Remove some reducers
      reducerManager.remove('auth')
      expect(Object.keys(reducerManager.getReducerMap())).toHaveLength(2)
      expect(reducerManager.getReducerMap().auth).toBeUndefined()

      // Add them back
      reducerManager.add('auth', mockReducer2)
      expect(Object.keys(reducerManager.getReducerMap())).toHaveLength(3)
      expect(reducerManager.getReducerMap().auth).toBeDefined()
    })

    it('should maintain reducer integrity during dynamic operations', () => {
      const originalFeature1 = reducerManager.getReducerMap().feature1

      // Add and remove other reducers
      reducerManager.add('temp', mockReducer2)
      reducerManager.remove('temp')

      // Original reducer should remain unchanged
      expect(reducerManager.getReducerMap().feature1).toBe(originalFeature1)
    })
  })

  describe('interface compliance', () => {
    it('should implement all required ReducerManager methods', () => {
      expect(typeof reducerManager.getReducerMap).toBe('function')
      expect(typeof reducerManager.reduce).toBe('function')
      expect(typeof reducerManager.add).toBe('function')
      expect(typeof reducerManager.remove).toBe('function')
    })

    it('should handle reducer function signatures correctly', () => {
      const testReducer = (state = { test: true }, action: any) => {
        switch (action.type) {
          case 'SET_TEST':
            return { ...state, test: action.payload }
          default:
            return state
        }
      }

      reducerManager.add('testFeature', testReducer)
      const action = { type: 'SET_TEST', payload: false }

      // Should not throw when calling reduce
      expect(() => reducerManager.reduce({}, action)).not.toThrow()
    })
  })
})
