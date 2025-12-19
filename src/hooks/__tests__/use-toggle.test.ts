import { act, renderHook } from '@testing-library/react'
import useToggle from '../use-toggle'

describe('useToggle', () => {
  it('should be a function', () => {
    expect(typeof useToggle).toBe('function')
  })

  it('should return state and actions', () => {
    const { result } = renderHook(() => useToggle())

    expect(Array.isArray(result.current)).toBe(true)
    expect(result.current.length).toBe(2)
    expect(typeof result.current[1]).toBe('object')
  })

  describe('default behavior (boolean toggle)', () => {
    it('should initialize with false', () => {
      const { result } = renderHook(() => useToggle())

      expect(result.current[0]).toBe(false)
    })

    it('should have toggle action', () => {
      const { result } = renderHook(() => useToggle())

      expect(typeof result.current[1].toggle).toBe('function')
    })

    it('should toggle from false to true', () => {
      const { result } = renderHook(() => useToggle())

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(true)
    })

    it('should toggle from true to false', () => {
      const { result } = renderHook(() => useToggle())

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(false)
    })

    it('should have setLeft action that sets to false', () => {
      const { result } = renderHook(() => useToggle())

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1].setLeft()
      })

      expect(result.current[0]).toBe(false)
    })

    it('should have setRight action that sets to true', () => {
      const { result } = renderHook(() => useToggle())

      act(() => {
        result.current[1].setRight()
      })

      expect(result.current[0]).toBe(true)
    })

    it('should have set action', () => {
      const { result } = renderHook(() => useToggle())

      act(() => {
        result.current[1].set(true)
      })

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1].set(false)
      })

      expect(result.current[0]).toBe(false)
    })

    it('should toggle multiple times', () => {
      const { result } = renderHook(() => useToggle())

      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[1].toggle()
      })
      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1].toggle()
      })
      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[1].toggle()
      })
      expect(result.current[0]).toBe(true)
    })
  })

  describe('custom default value', () => {
    it('should initialize with custom string value', () => {
      const { result } = renderHook(() => useToggle('left'))

      expect(result.current[0]).toBe('left')
    })

    it('should initialize with custom number value', () => {
      const { result } = renderHook(() => useToggle(0))

      expect(result.current[0]).toBe(0)
    })

    it('should initialize with custom object value', () => {
      const defaultObj = { name: 'default' }
      const { result } = renderHook(() => useToggle(defaultObj))

      expect(result.current[0]).toBe(defaultObj)
    })

    it('should toggle with custom default to inferred reverse', () => {
      const { result } = renderHook(() => useToggle('left'))

      // Reverse should be !defaultValue which is inferred as opposite
      act(() => {
        result.current[1].toggle()
      })

      // Since 'left' is truthy, !defaultValue would be false
      expect(result.current[0]).toBe(false)
    })

    it('should use setLeft with custom value', () => {
      const { result } = renderHook(() => useToggle('left'))

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[1].setLeft()
      })

      expect(result.current[0]).toBe('left')
    })

    it('should set custom value', () => {
      const { result } = renderHook(() => useToggle('left'))

      act(() => {
        result.current[1].set('custom')
      })

      expect(result.current[0]).toBe('custom')
    })
  })

  describe('custom default and reverse values', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useToggle('left', 'right'))

      expect(result.current[0]).toBe('left')
    })

    it('should toggle to reverse value', () => {
      const { result } = renderHook(() => useToggle('left', 'right'))

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe('right')
    })

    it('should toggle back to default', () => {
      const { result } = renderHook(() => useToggle('left', 'right'))

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe('right')

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe('left')
    })

    it('should use setLeft for default value', () => {
      const { result } = renderHook(() => useToggle('left', 'right'))

      act(() => {
        result.current[1].setRight()
      })

      expect(result.current[0]).toBe('right')

      act(() => {
        result.current[1].setLeft()
      })

      expect(result.current[0]).toBe('left')
    })

    it('should use setRight for reverse value', () => {
      const { result } = renderHook(() => useToggle('left', 'right'))

      act(() => {
        result.current[1].setRight()
      })

      expect(result.current[0]).toBe('right')
    })

    it('should work with number values', () => {
      const { result } = renderHook(() => useToggle(1, 2))

      expect(result.current[0]).toBe(1)

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(2)

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(1)
    })

    it('should work with object values', () => {
      const left = { name: 'left' }
      const right = { name: 'right' }
      const { result } = renderHook(() => useToggle(left, right))

      expect(result.current[0]).toBe(left)

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(right)
    })

    it('should work with array values', () => {
      const arr1 = [1, 2]
      const arr2 = [3, 4]
      const { result } = renderHook(() => useToggle(arr1, arr2))

      expect(result.current[0]).toBe(arr1)

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(arr2)
    })

    it('should set arbitrary values', () => {
      const { result } = renderHook(() => useToggle('left', 'right'))

      act(() => {
        result.current[1].set('custom')
      })

      expect(result.current[0]).toBe('custom')
    })

    it('should toggle even after setting arbitrary value', () => {
      const { result } = renderHook(() => useToggle('left', 'right'))

      act(() => {
        result.current[1].set('custom')
      })

      expect(result.current[0]).toBe('custom')

      act(() => {
        result.current[1].toggle()
      })

      // When state !== defaultValue, toggle returns to defaultValue
      expect(result.current[0]).toBe('left')
    })
  })

  describe('multiple instances', () => {
    it('should handle multiple independent instances', () => {
      const { result: result1 } = renderHook(() => useToggle('left', 'right'))
      const { result: result2 } = renderHook(() => useToggle('on', 'off'))

      expect(result1.current[0]).toBe('left')
      expect(result2.current[0]).toBe('on')

      act(() => {
        result1.current[1].toggle()
      })

      expect(result1.current[0]).toBe('right')
      expect(result2.current[0]).toBe('on')
    })

    it('should not affect other instances when setting value', () => {
      const { result: result1 } = renderHook(() => useToggle(1, 2))
      const { result: result2 } = renderHook(() => useToggle(1, 2))

      act(() => {
        result1.current[1].set(99)
      })

      expect(result1.current[0]).toBe(99)
      expect(result2.current[0]).toBe(1)
    })
  })

  describe('action reference stability', () => {
    it('should maintain stable action references', () => {
      const { result, rerender } = renderHook(() => useToggle('left', 'right'))

      const actions1 = result.current[1]

      rerender()

      const actions2 = result.current[1]

      expect(actions1.toggle).toBe(actions2.toggle)
      expect(actions1.set).toBe(actions2.set)
      expect(actions1.setLeft).toBe(actions2.setLeft)
      expect(actions1.setRight).toBe(actions2.setRight)
    })
  })

  describe('complex scenarios', () => {
    it('should handle mixed actions', () => {
      const { result } = renderHook(() => useToggle('a', 'b'))

      expect(result.current[0]).toBe('a')

      act(() => {
        result.current[1].setRight()
      })
      expect(result.current[0]).toBe('b')

      act(() => {
        result.current[1].toggle()
      })
      expect(result.current[0]).toBe('a')

      act(() => {
        result.current[1].set('c')
      })
      expect(result.current[0]).toBe('c')

      act(() => {
        result.current[1].setLeft()
      })
      expect(result.current[0]).toBe('a')
    })

    it('should handle rapid toggling', () => {
      const { result } = renderHook(() => useToggle(0, 1))

      act(() => {
        result.current[1].toggle()
        result.current[1].toggle()
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(1)
    })

    it('should handle setting and toggling sequence', () => {
      const { result } = renderHook(() => useToggle('x', 'y'))

      act(() => {
        result.current[1].set('custom')
      })

      expect(result.current[0]).toBe('custom')

      act(() => {
        result.current[1].toggle()
      })

      // When state !== defaultValue, toggle returns to defaultValue
      expect(result.current[0]).toBe('x')
    })

    it('should maintain state across multiple hook calls', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => {
          return useToggle('left', 'right')
        },
        { initialProps: { enabled: true } }
      )

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe('right')

      rerender({ enabled: false })

      expect(result.current[0]).toBe('right')
    })
  })

  describe('edge cases', () => {
    it('should work with undefined as reverse value', () => {
      const { result } = renderHook(() => useToggle('defined'))

      act(() => {
        result.current[1].toggle()
      })

      // Since 'defined' is truthy, !defaultValue would be false
      expect(result.current[0]).toBe(false)
    })

    it('should work with null as default value', () => {
      const { result } = renderHook(() => useToggle(null, 'not-null'))

      expect(result.current[0]).toBe(null)

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe('not-null')
    })

    it('should work with zero as default value', () => {
      const { result } = renderHook(() => useToggle(0, 1))

      expect(result.current[0]).toBe(0)

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(1)
    })

    it('should work with empty string as default value', () => {
      const { result } = renderHook(() => useToggle('', 'non-empty'))

      expect(result.current[0]).toBe('')

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe('non-empty')
    })

    it('should work with boolean true and false explicitly', () => {
      const { result } = renderHook(() => useToggle(true, false))

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(false)

      act(() => {
        result.current[1].toggle()
      })

      expect(result.current[0]).toBe(true)
    })

    it('should set to any value regardless of default/reverse', () => {
      const { result } = renderHook(() => useToggle('a', 'b'))

      act(() => {
        result.current[1].set('z')
      })

      expect(result.current[0]).toBe('z')

      act(() => {
        result.current[1].set('w')
      })

      expect(result.current[0]).toBe('w')
    })
  })

  describe('actions object', () => {
    it('should provide all four actions', () => {
      const { result } = renderHook(() => useToggle())

      expect(result.current[1]).toHaveProperty('toggle')
      expect(result.current[1]).toHaveProperty('set')
      expect(result.current[1]).toHaveProperty('setLeft')
      expect(result.current[1]).toHaveProperty('setRight')
    })

    it('should provide actions as functions', () => {
      const { result } = renderHook(() => useToggle())

      expect(typeof result.current[1].toggle).toBe('function')
      expect(typeof result.current[1].set).toBe('function')
      expect(typeof result.current[1].setLeft).toBe('function')
      expect(typeof result.current[1].setRight).toBe('function')
    })
  })
})
