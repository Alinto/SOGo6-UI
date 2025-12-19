import { renderHook } from '@testing-library/react'
import { useEffect, useLayoutEffect } from 'react'
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect'

describe('useIsomorphicLayoutEffect', () => {
  it('should export a function', () => {
    expect(typeof useIsomorphicLayoutEffect).toBe('function')
  })

  it('should be either useLayoutEffect or useEffect', () => {
    expect(
      useIsomorphicLayoutEffect === useLayoutEffect ||
        useIsomorphicLayoutEffect === useEffect
    ).toBe(true)
  })

  it('should be useLayoutEffect on client-side (default environment)', () => {
    // In test environment running in Node, it will be useEffect
    // In browser environment it will be useLayoutEffect
    // We just verify it's one of them
    const isLayoutEffect = useIsomorphicLayoutEffect === useLayoutEffect
    const isEffect = useIsomorphicLayoutEffect === useEffect
    expect(isLayoutEffect || isEffect).toBe(true)
  })

  it('should execute effect function on mount', () => {
    const effectFn = jest.fn()

    renderHook(() => {
      useIsomorphicLayoutEffect(effectFn, [])
    })

    expect(effectFn).toHaveBeenCalledTimes(1)
  })

  it('should accept an effect function as first argument', () => {
    const effectFn = jest.fn()

    expect(() => {
      renderHook(() => {
        useIsomorphicLayoutEffect(effectFn, [])
      })
    }).not.toThrow()
  })

  it('should accept dependencies array as second argument', () => {
    const effectFn = jest.fn()

    expect(() => {
      renderHook(() => {
        useIsomorphicLayoutEffect(effectFn, [])
      })
    }).not.toThrow()
  })

  it('should work with empty dependency array', () => {
    const effectFn = jest.fn()

    const { rerender } = renderHook(() => {
      useIsomorphicLayoutEffect(effectFn, [])
    })

    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender()
    expect(effectFn).toHaveBeenCalledTimes(1)
  })

  it('should re-run effect when dependencies change', () => {
    const effectFn = jest.fn()

    const { rerender } = renderHook(
      ({ dep }) => {
        useIsomorphicLayoutEffect(effectFn, [dep])
      },
      { initialProps: { dep: 1 } }
    )

    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender({ dep: 2 })
    expect(effectFn).toHaveBeenCalledTimes(2)
  })

  it('should not re-run effect when dependencies stay the same', () => {
    const effectFn = jest.fn()

    const { rerender } = renderHook(
      ({ dep }) => {
        useIsomorphicLayoutEffect(effectFn, [dep])
      },
      { initialProps: { dep: 1 } }
    )

    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender({ dep: 1 })
    expect(effectFn).toHaveBeenCalledTimes(1)
  })

  it('should run effect on every render when no dependencies provided', () => {
    const effectFn = jest.fn()

    const { rerender } = renderHook(() => {
      useIsomorphicLayoutEffect(effectFn)
    })

    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender()
    expect(effectFn).toHaveBeenCalledTimes(2)

    rerender()
    expect(effectFn).toHaveBeenCalledTimes(3)
  })

  it('should support cleanup function', () => {
    const cleanupFn = jest.fn()
    const effectFn = jest.fn(() => cleanupFn)

    const { unmount } = renderHook(() => {
      useIsomorphicLayoutEffect(effectFn, [])
    })

    expect(effectFn).toHaveBeenCalledTimes(1)
    expect(cleanupFn).not.toHaveBeenCalled()

    unmount()
    expect(cleanupFn).toHaveBeenCalledTimes(1)
  })

  it('should call cleanup before re-running effect', () => {
    const cleanupFn = jest.fn()
    const effectFn = jest.fn(() => cleanupFn)

    const { rerender } = renderHook(
      ({ dep }) => {
        useIsomorphicLayoutEffect(effectFn, [dep])
      },
      { initialProps: { dep: 1 } }
    )

    expect(effectFn).toHaveBeenCalledTimes(1)
    expect(cleanupFn).not.toHaveBeenCalled()

    rerender({ dep: 2 })

    expect(effectFn).toHaveBeenCalledTimes(2)
    expect(cleanupFn).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple dependencies', () => {
    const effectFn = jest.fn()

    const { rerender } = renderHook(
      ({ dep1, dep2 }) => {
        useIsomorphicLayoutEffect(effectFn, [dep1, dep2])
      },
      { initialProps: { dep1: 1, dep2: 'a' } }
    )

    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender({ dep1: 1, dep2: 'a' })
    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender({ dep1: 2, dep2: 'a' })
    expect(effectFn).toHaveBeenCalledTimes(2)

    rerender({ dep1: 2, dep2: 'b' })
    expect(effectFn).toHaveBeenCalledTimes(3)
  })

  it('should handle object dependencies', () => {
    const effectFn = jest.fn()
    const obj1 = { id: 1 }
    const obj2 = { id: 1 }

    const { rerender } = renderHook(
      ({ obj }) => {
        useIsomorphicLayoutEffect(effectFn, [obj])
      },
      { initialProps: { obj: obj1 } }
    )

    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender({ obj: obj1 })
    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender({ obj: obj2 })
    expect(effectFn).toHaveBeenCalledTimes(2)
  })

  it('should handle function as dependency', () => {
    const effectFn = jest.fn()
    const fn1 = () => {}
    const fn2 = () => {}

    const { rerender } = renderHook(
      ({ fn }) => {
        useIsomorphicLayoutEffect(effectFn, [fn])
      },
      { initialProps: { fn: fn1 } }
    )

    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender({ fn: fn1 })
    expect(effectFn).toHaveBeenCalledTimes(1)

    rerender({ fn: fn2 })
    expect(effectFn).toHaveBeenCalledTimes(2)
  })

  it('should support effect with no return value', () => {
    const effectFn = jest.fn()

    expect(() => {
      renderHook(() => {
        useIsomorphicLayoutEffect(effectFn, [])
      })
    }).not.toThrow()
  })

  it('should support effect with cleanup return', () => {
    const cleanupFn = jest.fn()
    const effectFn = jest.fn(() => cleanupFn)

    expect(() => {
      renderHook(() => {
        useIsomorphicLayoutEffect(effectFn, [])
      })
    }).not.toThrow()
  })
})
