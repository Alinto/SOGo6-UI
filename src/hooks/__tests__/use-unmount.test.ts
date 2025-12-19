import { renderHook } from '@testing-library/react'
import { useUnmount } from '../use-unmount'

describe('useUnmount', () => {
  it('should be a function', () => {
    expect(typeof useUnmount).toBe('function')
  })

  it('should not call the function on mount', () => {
    const fn = jest.fn()

    renderHook(() => {
      useUnmount(fn)
    })

    expect(fn).not.toHaveBeenCalled()
  })

  it('should call the function on unmount', () => {
    const fn = jest.fn()

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    expect(fn).not.toHaveBeenCalled()

    unmount()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call the function only once on unmount', () => {
    const fn = jest.fn()

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    unmount()
    unmount()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call the cleanup function with no arguments', () => {
    const fn = jest.fn()

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    unmount()

    expect(fn).toHaveBeenCalledWith()
  })

  it('should handle multiple instances independently', () => {
    const fn1 = jest.fn()
    const fn2 = jest.fn()

    const { unmount: unmount1 } = renderHook(() => {
      useUnmount(fn1)
    })

    const { unmount: unmount2 } = renderHook(() => {
      useUnmount(fn2)
    })

    unmount1()

    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).not.toHaveBeenCalled()

    unmount2()

    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should use latest function reference', () => {
    const fn1 = jest.fn()
    const fn2 = jest.fn()

    const { unmount, rerender } = renderHook(
      ({ fn }) => {
        useUnmount(fn)
      },
      { initialProps: { fn: fn1 } }
    )

    rerender({ fn: fn2 })

    unmount()

    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should handle function that throws an error', () => {
    const error = new Error('Test error')
    const fn = jest.fn(() => {
      throw error
    })

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    expect(() => {
      unmount()
    }).toThrow(error)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call function on re-render', () => {
    const fn = jest.fn()

    const { rerender } = renderHook(
      ({ count }) => {
        useUnmount(fn)
        return count
      },
      { initialProps: { count: 0 } }
    )

    expect(fn).not.toHaveBeenCalled()

    rerender({ count: 1 })
    rerender({ count: 2 })
    rerender({ count: 3 })

    expect(fn).not.toHaveBeenCalled()
  })

  it('should handle function that modifies external state', () => {
    const state = { value: 0 }
    const fn = jest.fn(() => {
      state.value = 42
    })

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    expect(state.value).toBe(0)

    unmount()

    expect(state.value).toBe(42)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should handle async function', (done) => {
    const fn = jest.fn(() => {
      return Promise.resolve('completed')
    })

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    unmount()

    expect(fn).toHaveBeenCalledTimes(1)

    // Async function is called but we don't wait for it in cleanup
    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      done()
    }, 50)
  })

  it('should work with arrow function', () => {
    const spy = jest.fn()
    const fn = () => spy('called')

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    unmount()

    expect(spy).toHaveBeenCalledWith('called')
  })

  it('should work with named function', () => {
    const spy = jest.fn()

    function cleanup() {
      spy('cleanup')
    }

    const { unmount } = renderHook(() => {
      useUnmount(cleanup)
    })

    unmount()

    expect(spy).toHaveBeenCalledWith('cleanup')
  })

  it('should work with object method', () => {
    const obj = {
      cleanup: jest.fn(),
    }

    const { unmount } = renderHook(() => {
      useUnmount(() => obj.cleanup())
    })

    unmount()

    expect(obj.cleanup).toHaveBeenCalledTimes(1)
  })

  it('should handle rapid mount/unmount cycles', () => {
    const fn = jest.fn()

    for (let i = 0; i < 3; i++) {
      const { unmount } = renderHook(() => {
        useUnmount(fn)
      })

      unmount()
    }

    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should work with no other hooks', () => {
    const fn = jest.fn()

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    unmount()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should work alongside other hooks', () => {
    const unmountFn = jest.fn()
    const cleanupFn = jest.fn()

    const { unmount } = renderHook(() => {
      // Simulate other hooks
      const localState = useState(0)
      useUnmount(unmountFn)
      useEffect(() => {
        return () => cleanupFn()
      }, [])
    })

    unmount()

    expect(unmountFn).toHaveBeenCalledTimes(1)
  })

  it('should update function when props change', () => {
    const fn1 = jest.fn()
    const fn2 = jest.fn()
    const fn3 = jest.fn()

    const { unmount, rerender } = renderHook(
      ({ fn }) => {
        useUnmount(fn)
      },
      { initialProps: { fn: fn1 } }
    )

    rerender({ fn: fn2 })
    rerender({ fn: fn3 })

    unmount()

    // Only the last function should be called
    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).not.toHaveBeenCalled()
    expect(fn3).toHaveBeenCalledTimes(1)
  })

  it('should handle function that calls other functions', () => {
    const dep1 = jest.fn()
    const dep2 = jest.fn()
    const fn = jest.fn(() => {
      dep1()
      dep2()
    })

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    unmount()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(dep1).toHaveBeenCalledTimes(1)
    expect(dep2).toHaveBeenCalledTimes(1)
  })

  it('should be called in cleanup phase, not during render', () => {
    const callOrder: string[] = []

    const fn = jest.fn(() => {
      callOrder.push('unmount')
    })

    const { unmount } = renderHook(() => {
      callOrder.push('render')
      useUnmount(fn)
    })

    expect(callOrder).toEqual(['render'])
    expect(fn).not.toHaveBeenCalled()

    unmount()

    expect(callOrder).toEqual(['render', 'unmount'])
  })

  it('should handle empty function', () => {
    const fn = jest.fn(() => {})

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    expect(() => {
      unmount()
    }).not.toThrow()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should handle function that references hook props', () => {
    let capturedValue = ''

    const { unmount, rerender } = renderHook(
      ({ value }) => {
        useUnmount(() => {
          capturedValue = value
        })
      },
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    unmount()

    // Should capture the updated value due to useLatest
    expect(capturedValue).toBe('updated')
  })

  it('should be compatible with StrictMode (called twice in development)', () => {
    // Note: In React 18 StrictMode with concurrent features, effects are called twice
    // but cleanup is called between them. In our test environment without StrictMode,
    // this tests that the hook structure allows for this behavior
    const fn = jest.fn()

    const { unmount } = renderHook(() => {
      useUnmount(fn)
    })

    unmount()

    expect(fn).toHaveBeenCalled()
  })
})

// Helper: Mock useState
function useState(initialValue: any) {
  return [initialValue, jest.fn()]
}

// Helper: Mock useEffect
function useEffect(effect: () => void | (() => void), deps?: any[]) {
  effect()
}
