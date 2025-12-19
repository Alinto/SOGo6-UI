import { act, renderHook } from '@testing-library/react'
import { useBoolean } from '../use-boolean'

describe('useBoolean', () => {
  it('should initialize with default value false', () => {
    const { result } = renderHook(() => useBoolean())
    const [state] = result.current

    expect(state).toBe(false)
  })

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useBoolean(true))
    const [state] = result.current

    expect(state).toBe(true)
  })

  it('should return state and actions object', () => {
    const { result } = renderHook(() => useBoolean())
    const [state, actions] = result.current

    expect(typeof state).toBe('boolean')
    expect(typeof actions).toBe('object')
    expect(actions).toHaveProperty('set')
    expect(actions).toHaveProperty('setTrue')
    expect(actions).toHaveProperty('setFalse')
    expect(actions).toHaveProperty('toggle')
  })

  it('should have all action methods as functions', () => {
    const { result } = renderHook(() => useBoolean())
    const [, actions] = result.current

    expect(typeof actions.set).toBe('function')
    expect(typeof actions.setTrue).toBe('function')
    expect(typeof actions.setFalse).toBe('function')
    expect(typeof actions.toggle).toBe('function')
  })

  it('should set value to true using set()', () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current[1].set(true)
    })

    expect(result.current[0]).toBe(true)
  })

  it('should set value to false using set()', () => {
    const { result } = renderHook(() => useBoolean(true))

    act(() => {
      result.current[1].set(false)
    })

    expect(result.current[0]).toBe(false)
  })

  it('should set value to true using setTrue()', () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current[1].setTrue()
    })

    expect(result.current[0]).toBe(true)
  })

  it('should set value to false using setFalse()', () => {
    const { result } = renderHook(() => useBoolean(true))

    act(() => {
      result.current[1].setFalse()
    })

    expect(result.current[0]).toBe(false)
  })

  it('should toggle value from false to true', () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current[1].toggle()
    })

    expect(result.current[0]).toBe(true)
  })

  it('should toggle value from true to false', () => {
    const { result } = renderHook(() => useBoolean(true))

    act(() => {
      result.current[1].toggle()
    })

    expect(result.current[0]).toBe(false)
  })

  it('should toggle multiple times', () => {
    const { result } = renderHook(() => useBoolean(false))

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

  it('should handle multiple sequential set operations', () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current[1].set(true)
      result.current[1].set(false)
      result.current[1].set(true)
    })

    expect(result.current[0]).toBe(true)
  })

  it('should handle mixed operations', () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current[1].setTrue()
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1].toggle()
    })
    expect(result.current[0]).toBe(false)

    act(() => {
      result.current[1].setTrue()
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1].setFalse()
    })
    expect(result.current[0]).toBe(false)
  })

  it('should return a tuple with two elements', () => {
    const { result } = renderHook(() => useBoolean())

    expect(result.current).toHaveLength(2)
    expect(typeof result.current[0]).toBe('boolean')
    expect(typeof result.current[1]).toBe('object')
  })

  it('should maintain actions reference stability', () => {
    const { result, rerender } = renderHook(() => useBoolean())
    const firstActionsRef = result.current[1]

    rerender()

    const secondActionsRef = result.current[1]
    expect(firstActionsRef).toBe(secondActionsRef)
  })

  it('should work with multiple instances independently', () => {
    const { result: result1 } = renderHook(() => useBoolean(false))
    const { result: result2 } = renderHook(() => useBoolean(true))

    expect(result1.current[0]).toBe(false)
    expect(result2.current[0]).toBe(true)

    act(() => {
      result1.current[1].setTrue()
    })

    expect(result1.current[0]).toBe(true)
    expect(result2.current[0]).toBe(true)

    act(() => {
      result2.current[1].setFalse()
    })

    expect(result1.current[0]).toBe(true)
    expect(result2.current[0]).toBe(false)
  })
})
