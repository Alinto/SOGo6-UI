import { renderHook } from '@testing-library/react'
import { useEffect, useLayoutEffect } from 'react'
import {
  createEffectWithTarget,
  getTargetElement,
} from '../create-effect-with-target'

// Mock es-toolkit
jest.mock('es-toolkit', () => ({
  isBrowser: true,
  isFunction: (val: any) => typeof val === 'function',
  isEqual: (a: any, b: any) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((item, idx) => item === b[idx])
    }
    return a === b
  },
}))

// Mock useUnmount hook
jest.mock('@/hooks/use-unmount', () => ({
  useUnmount: jest.fn((fn: () => void) => {
    // Store cleanup function for later testing
  }),
}))

describe('getTargetElement', () => {
  it('should be a function', () => {
    expect(typeof getTargetElement).toBe('function')
  })

  it('should return undefined when target is null in browser', () => {
    const result = getTargetElement(null)
    expect(result).toBeUndefined()
  })

  it('should return undefined when target is undefined in browser', () => {
    const result = getTargetElement(undefined)
    expect(result).toBeUndefined()
  })

  it('should return default element when target is null', () => {
    const defaultEl = document.createElement('div')
    const result = getTargetElement(null, defaultEl)
    expect(result).toBe(defaultEl)
  })

  it('should return default element when target is undefined', () => {
    const defaultEl = document.createElement('div')
    const result = getTargetElement(undefined, defaultEl)
    expect(result).toBe(defaultEl)
  })

  it('should return target element directly when provided as Element', () => {
    const el = document.createElement('div')
    const result = getTargetElement(el)
    expect(result).toBe(el)
  })

  it('should return target element from function', () => {
    const el = document.createElement('div')
    const target = () => el
    const result = getTargetElement(target)
    expect(result).toBe(el)
  })

  it('should return target element from function returning null', () => {
    const target = () => null
    const result = getTargetElement(target)
    expect(result).toBeNull()
  })

  it('should return target element from ref object', () => {
    const el = document.createElement('div')
    const ref = { current: el }
    const result = getTargetElement(ref)
    expect(result).toBe(el)
  })

  it('should return undefined from ref with no current', () => {
    const ref = { current: null }
    const result = getTargetElement(ref)
    expect(result).toBeNull()
  })

  it('should handle window as target', () => {
    const result = getTargetElement(window)
    expect(result).toBe(window)
  })

  it('should handle document as target', () => {
    const result = getTargetElement(document)
    expect(result).toBe(document)
  })

  it('should handle function returning window', () => {
    const result = getTargetElement(() => window)
    expect(result).toBe(window)
  })

  it('should handle ref to window', () => {
    const ref = { current: window }
    const result = getTargetElement(ref)
    expect(result).toBe(window)
  })
})

describe('createEffectWithTarget', () => {
  it('should be a function', () => {
    expect(typeof createEffectWithTarget).toBe('function')
  })

  it('should return a function when called with useEffect', () => {
    const result = createEffectWithTarget(useEffect)
    expect(typeof result).toBe('function')
  })

  it('should return a function when called with useLayoutEffect', () => {
    const result = createEffectWithTarget(useLayoutEffect)
    expect(typeof result).toBe('function')
  })

  describe('useEffectWithTarget hook', () => {
    it('should run effect on first render with single target', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect, [], target)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should run effect on first render with multiple targets', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target1 = document.createElement('div')
      const target2 = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect, [], [target1, target2])
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should run effect with function target', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const el = document.createElement('div')
      const target = () => el

      renderHook(() => {
        useEffectWithTarget(effect, [], target)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should run effect with ref target', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const ref = { current: document.createElement('div') }

      renderHook(() => {
        useEffectWithTarget(effect, [], ref)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle null return from effect', () => {
      const effect = jest.fn(() => null)
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')

      expect(() => {
        renderHook(() => {
          useEffectWithTarget(effect, [], target)
        })
      }).not.toThrow()
    })

    it('should handle undefined return from effect', () => {
      const effect = jest.fn(() => undefined)
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')

      expect(() => {
        renderHook(() => {
          useEffectWithTarget(effect, [], target)
        })
      }).not.toThrow()
    })

    it('should work with multiple targets array', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const targets = [
        document.createElement('div'),
        document.createElement('span'),
        document.createElement('p'),
      ]

      renderHook(() => {
        useEffectWithTarget(effect, [], targets)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should work with mixed target types in array', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const el1 = document.createElement('div')
      const el2 = document.createElement('span')

      const targets = [el1, () => el2, { current: document.createElement('p') }]

      renderHook(() => {
        useEffectWithTarget(effect, [], targets)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle dependencies array', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect, [1, 2, 3], target)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle empty dependencies array', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect, [], target)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should work with useLayoutEffect', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useLayoutEffect)
      const target = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect, [], target)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should work with window target', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)

      renderHook(() => {
        useEffectWithTarget(effect, [], window)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should work with document target', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)

      renderHook(() => {
        useEffectWithTarget(effect, [], document)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle null target', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)

      renderHook(() => {
        useEffectWithTarget(effect, [], null)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle undefined target', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)

      renderHook(() => {
        useEffectWithTarget(effect, [], undefined)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle effect that throws error', () => {
      const error = new Error('Effect error')
      const effect = jest.fn(() => {
        throw error
      })
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')

      // Effects can throw errors, renderHook will propagate them
      // This test verifies that the hook structure doesn't prevent error handling
      expect(() => {
        renderHook(() => {
          useEffectWithTarget(effect, [], target)
        })
      }).toThrow('Effect error')
    })

    it('should work with multiple single target elements', () => {
      const effect1 = jest.fn()
      const effect2 = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target1 = document.createElement('div')
      const target2 = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect1, [], target1)
      })

      renderHook(() => {
        useEffectWithTarget(effect2, [], target2)
      })

      expect(effect1).toHaveBeenCalledTimes(1)
      expect(effect2).toHaveBeenCalledTimes(1)
    })

    it('should work with complex target scenarios', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)

      const el1 = document.createElement('div')
      const el2 = document.createElement('span')
      const targets = [
        el1,
        () => el2,
        { current: document.createElement('p') },
        window,
        null,
      ]

      renderHook(() => {
        useEffectWithTarget(effect, [true, false], targets)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle function target that returns null', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = () => null

      renderHook(() => {
        useEffectWithTarget(effect, [], target)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle ref with null current', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const ref = { current: null }

      renderHook(() => {
        useEffectWithTarget(effect, [], ref)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle array with null values', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const el = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect, [], [null, el, null])
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should work with same effect multiple times', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target1 = document.createElement('div')
      const target2 = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect, [], target1)
      })

      const hook2 = createEffectWithTarget(useEffect)
      renderHook(() => {
        hook2(effect, [], target2)
      })

      expect(effect).toHaveBeenCalledTimes(2)
    })

    it('should handle effect with cleanup function', () => {
      const cleanup = jest.fn()
      const effect = jest.fn(() => cleanup)
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect, [], target)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle initial ref initialization', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')

      renderHook(() => {
        useEffectWithTarget(effect, [], target)
      })

      // Should only run once on initial render
      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should create different hook instances independently', () => {
      const effect1 = jest.fn()
      const effect2 = jest.fn()

      const hook1 = createEffectWithTarget(useEffect)
      const hook2 = createEffectWithTarget(useEffect)

      renderHook(() => {
        hook1(effect1, [], document.createElement('div'))
      })

      renderHook(() => {
        hook2(effect2, [], document.createElement('div'))
      })

      expect(effect1).toHaveBeenCalledTimes(1)
      expect(effect2).toHaveBeenCalledTimes(1)
    })

    it('should work with complex dependencies', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')
      const deps = [1, 'string', { obj: true }, [1, 2, 3]]

      renderHook(() => {
        useEffectWithTarget(effect, deps, target)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle effect that accesses target properties', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')
      target.id = 'test-id'

      renderHook(() => {
        useEffectWithTarget(
          () => {
            expect(target.id).toBe('test-id')
            effect()
          },
          [],
          target
        )
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should work when effect uses multiple targets', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const el1 = document.createElement('div')
      const el2 = document.createElement('span')
      const el3 = document.createElement('p')

      renderHook(() => {
        useEffectWithTarget(effect, [], [el1, el2, el3])
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle ref function combination', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const el = document.createElement('div')

      const targets = [
        { current: el },
        () => document.createElement('span'),
        document.createElement('p'),
      ]

      renderHook(() => {
        useEffectWithTarget(effect, [], targets)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should handle single vs array target formats equivalently', () => {
      const effect1 = jest.fn()
      const effect2 = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const el = document.createElement('div')

      // Single target
      renderHook(() => {
        useEffectWithTarget(effect1, [], el)
      })

      // Array with single target
      renderHook(() => {
        useEffectWithTarget(effect2, [], [el])
      })

      expect(effect1).toHaveBeenCalledTimes(1)
      expect(effect2).toHaveBeenCalledTimes(1)
    })

    it('should work with empty target array', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)

      renderHook(() => {
        useEffectWithTarget(effect, [], [])
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should work with only function targets', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const getEl1 = () => document.createElement('div')
      const getEl2 = () => document.createElement('span')

      renderHook(() => {
        useEffectWithTarget(effect, [], [getEl1, getEl2])
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should work with only ref targets', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const ref1 = { current: document.createElement('div') }
      const ref2 = { current: document.createElement('span') }

      renderHook(() => {
        useEffectWithTarget(effect, [], [ref1, ref2])
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('should be compatible with various dependency types', () => {
      const effect = jest.fn()
      const useEffectWithTarget = createEffectWithTarget(useEffect)
      const target = document.createElement('div')
      const deps = [
        42,
        'string',
        true,
        false,
        null,
        { nested: { value: 1 } },
        [1, 2, 3],
      ]

      renderHook(() => {
        useEffectWithTarget(effect, deps, target)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })
  })
})
