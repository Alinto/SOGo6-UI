import '@testing-library/jest-dom'

// Mock react-redux
const mockUseDispatch = jest.fn()
const mockUseSelector = jest.fn()
const mockUseStore = jest.fn()

jest.mock('react-redux', () => ({
  useDispatch: {
    withTypes: jest.fn(() => mockUseDispatch),
  },
  useSelector: {
    withTypes: jest.fn(() => mockUseSelector),
  },
  useStore: {
    withTypes: jest.fn(() => mockUseStore),
  },
}))

// Mock store types
jest.mock('../store', () => ({
  AppDispatch: {},
  AppStore: {},
  RootState: {},
}))

jest.mock('../reducer-manager', () => ({
  ReducerManager: {},
}))

describe('Redux Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('useAppDispatch', () => {
    it('should be defined and be a function', async () => {
      const { useAppDispatch } = await import('../hooks')
      expect(typeof useAppDispatch).toBe('function')
    })

    it('should create typed dispatch hook', async () => {
      const { useAppDispatch } = await import('../hooks')
      expect(useAppDispatch).toBe(mockUseDispatch)
    })

    it('should call useDispatch.withTypes during module initialization', async () => {
      const reactRedux = require('react-redux')
      await import('../hooks')

      expect(reactRedux.useDispatch.withTypes).toHaveBeenCalled()
    })
  })

  describe('useAppSelector', () => {
    it('should be defined and be a function', async () => {
      const { useAppSelector } = await import('../hooks')
      expect(typeof useAppSelector).toBe('function')
    })

    it('should create typed selector hook', async () => {
      const { useAppSelector } = await import('../hooks')
      expect(useAppSelector).toBe(mockUseSelector)
    })

    it('should call useSelector.withTypes during module initialization', async () => {
      const reactRedux = require('react-redux')
      await import('../hooks')

      expect(reactRedux.useSelector.withTypes).toHaveBeenCalled()
    })
  })

  describe('useAppStore', () => {
    it('should be defined and be a function', async () => {
      const { useAppStore } = await import('../hooks')
      expect(typeof useAppStore).toBe('function')
    })

    it('should create typed store hook', async () => {
      const { useAppStore } = await import('../hooks')
      expect(useAppStore).toBe(mockUseStore)
    })

    it('should call useStore.withTypes during module initialization', async () => {
      const reactRedux = require('react-redux')
      await import('../hooks')

      expect(reactRedux.useStore.withTypes).toHaveBeenCalled()
    })
  })

  describe('type safety', () => {
    it('should export all three typed hooks', async () => {
      const hooks = await import('../hooks')

      expect(hooks.useAppDispatch).toBeDefined()
      expect(hooks.useAppSelector).toBeDefined()
      expect(hooks.useAppStore).toBeDefined()
    })

    it('should create hooks with proper type safety', async () => {
      const reactRedux = require('react-redux')
      await import('../hooks')

      // Verify that each hook is created with proper typing
      expect(reactRedux.useDispatch.withTypes).toHaveBeenCalledTimes(1)
      expect(reactRedux.useSelector.withTypes).toHaveBeenCalledTimes(1)
      expect(reactRedux.useStore.withTypes).toHaveBeenCalledTimes(1)
    })
  })

  describe('integration', () => {
    it('should properly integrate with Redux TypeScript setup', async () => {
      // This test ensures the hooks module can be imported without errors
      await expect(import('../hooks')).resolves.toBeDefined()
    })

    it('should maintain proper exports structure', async () => {
      const hooks = await import('../hooks')
      const exports = Object.keys(hooks)

      expect(exports).toContain('useAppDispatch')
      expect(exports).toContain('useAppSelector')
      expect(exports).toContain('useAppStore')
      expect(exports).toHaveLength(3)
    })
  })
})
