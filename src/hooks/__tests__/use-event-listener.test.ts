import { renderHook } from '@testing-library/react'
import { useEventListener } from '../use-event-listener'

describe('useEventListener', () => {
  let addEventListenerSpy: jest.Mock
  let removeEventListenerSpy: jest.Mock

  beforeEach(() => {
    // Mock addEventListener and removeEventListener on window
    addEventListenerSpy = jest.fn()
    removeEventListenerSpy = jest.fn()

    window.addEventListener = addEventListenerSpy
    window.removeEventListener = removeEventListenerSpy
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be a function', () => {
    expect(typeof useEventListener).toBe('function')
  })

  it('should add event listener on mount', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler)
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      expect.any(Object)
    )
  })

  it('should remove event listener on unmount', () => {
    const handler = jest.fn()

    const { unmount } = renderHook(() => {
      useEventListener('click', handler)
    })

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      expect.any(Object)
    )
  })

  it('should handle single event name', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler)
    })

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      expect.any(Object)
    )
  })

  it('should handle multiple event names', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener(['click', 'mouseover'], handler)
    })

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(
      1,
      'click',
      expect.any(Function),
      expect.any(Object)
    )
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(
      2,
      'mouseover',
      expect.any(Function),
      expect.any(Object)
    )
  })

  it('should remove all event listeners on unmount', () => {
    const handler = jest.fn()

    const { unmount } = renderHook(() => {
      useEventListener(['click', 'mouseover'], handler)
    })

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2)
  })

  it('should pass capture option to addEventListener', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler, { capture: true })
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      expect.objectContaining({ capture: true })
    )
  })

  it('should pass once option to addEventListener', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler, { once: true })
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      expect.objectContaining({ once: true })
    )
  })

  it('should pass passive option to addEventListener', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler, { passive: true })
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      expect.objectContaining({ passive: true })
    )
  })

  it('should combine multiple options', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler, {
        capture: true,
        once: true,
        passive: false,
      })
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      expect.objectContaining({ capture: true, once: true, passive: false })
    )
  })

  it('should not add listener when enable is false', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler, { enable: false })
    })

    expect(addEventListenerSpy).not.toHaveBeenCalled()
  })

  it('should add listener when enable is true', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler, { enable: true })
    })

    expect(addEventListenerSpy).toHaveBeenCalled()
  })

  it('should handle enable option change', () => {
    const handler = jest.fn()

    const { rerender } = renderHook(
      ({ enable }) => {
        useEventListener('click', handler, { enable })
      },
      { initialProps: { enable: false } }
    )

    expect(addEventListenerSpy).not.toHaveBeenCalled()

    rerender({ enable: true })

    expect(addEventListenerSpy).toHaveBeenCalled()
  })

  it('should handle default enable value as true', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler)
    })

    expect(addEventListenerSpy).toHaveBeenCalled()
  })

  it('should accept window as target', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler, { target: window })
    })

    expect(addEventListenerSpy).toHaveBeenCalled()
  })

  it('should accept document as target', () => {
    const handler = jest.fn()
    const documentAddEventListenerSpy = jest.fn()
    document.addEventListener = documentAddEventListenerSpy

    renderHook(() => {
      useEventListener('click', handler, { target: document })
    })

    expect(documentAddEventListenerSpy).toHaveBeenCalled()
  })

  it('should accept element as target', () => {
    const handler = jest.fn()
    const element = document.createElement('div')
    const elementAddEventListenerSpy = jest.fn()
    element.addEventListener = elementAddEventListenerSpy

    renderHook(() => {
      useEventListener('click', handler, { target: element })
    })

    expect(elementAddEventListenerSpy).toHaveBeenCalled()
  })

  it('should handle null target', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler, { target: null })
    })

    // Should fall back to window
    expect(addEventListenerSpy).toHaveBeenCalled()
  })

  it('should handle undefined target', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('click', handler, { target: undefined })
    })

    // Should fall back to window
    expect(addEventListenerSpy).toHaveBeenCalled()
  })

  it('should re-add listeners when event name changes', () => {
    const handler = jest.fn()
    addEventListenerSpy.mockClear()
    removeEventListenerSpy.mockClear()

    const { rerender } = renderHook(
      ({ eventName }) => {
        useEventListener(eventName, handler)
      },
      { initialProps: { eventName: 'click' } }
    )

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)

    rerender({ eventName: 'mouseover' })

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1)
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
  })

  it('should re-add listeners when capture option changes', () => {
    const handler = jest.fn()
    removeEventListenerSpy.mockClear()
    addEventListenerSpy.mockClear()

    const { rerender } = renderHook(
      ({ capture }) => {
        useEventListener('click', handler, { capture })
      },
      { initialProps: { capture: false } }
    )

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)

    rerender({ capture: true })

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1)
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
  })

  it('should re-add listeners when once option changes', () => {
    const handler = jest.fn()
    removeEventListenerSpy.mockClear()
    addEventListenerSpy.mockClear()

    const { rerender } = renderHook(
      ({ once }) => {
        useEventListener('click', handler, { once })
      },
      { initialProps: { once: false } }
    )

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)

    rerender({ once: true })

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1)
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
  })

  it('should re-add listeners when passive option changes', () => {
    const handler = jest.fn()
    removeEventListenerSpy.mockClear()
    addEventListenerSpy.mockClear()

    const { rerender } = renderHook(
      ({ passive }) => {
        useEventListener('click', handler, { passive })
      },
      { initialProps: { passive: false } }
    )

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)

    rerender({ passive: true })

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1)
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
  })

  it('should call handler with event when listener is triggered', () => {
    const handler = jest.fn()
    let eventListener: ((event: Event) => void) | null = null

    addEventListenerSpy.mockImplementation((event, listener) => {
      eventListener = listener
    })

    renderHook(() => {
      useEventListener('click', handler)
    })

    const mockEvent = new Event('click')
    if (eventListener) {
      eventListener(mockEvent)
    }

    expect(handler).toHaveBeenCalledWith(mockEvent)
  })

  it('should handle multiple instances independently', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()

    renderHook(() => {
      useEventListener('click', handler1)
      useEventListener('mouseover', handler2)
    })

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
  })

  it('should handle array of event names with options', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener(['click', 'mouseover', 'mouseout'], handler, {
        capture: true,
      })
    })

    expect(addEventListenerSpy).toHaveBeenCalledTimes(3)
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(
      1,
      'click',
      expect.any(Function),
      expect.objectContaining({ capture: true })
    )
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(
      2,
      'mouseover',
      expect.any(Function),
      expect.objectContaining({ capture: true })
    )
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(
      3,
      'mouseout',
      expect.any(Function),
      expect.objectContaining({ capture: true })
    )
  })

  it('should not call removeEventListener with wrong capture value', () => {
    const handler = jest.fn()
    const element = document.createElement('div')
    const elementRemoveEventListenerSpy = jest.fn()
    element.removeEventListener = elementRemoveEventListenerSpy

    const { unmount } = renderHook(() => {
      useEventListener('click', handler, { target: element, capture: true })
    })

    unmount()

    expect(elementRemoveEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      expect.objectContaining({ capture: true })
    )
  })

  it('should handle handler updates', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()
    let eventListener: ((event: Event) => void) | null = null

    addEventListenerSpy.mockImplementation((event, listener) => {
      eventListener = listener
    })

    const { rerender } = renderHook(
      ({ handler }) => {
        useEventListener('click', handler)
      },
      { initialProps: { handler: handler1 } }
    )

    const mockEvent = new Event('click')
    if (eventListener) {
      eventListener(mockEvent)
    }

    expect(handler1).toHaveBeenCalledWith(mockEvent)
    expect(handler2).not.toHaveBeenCalled()

    // Update handler - should not re-add listener since useLatest is used
    rerender({ handler: handler2 })

    if (eventListener) {
      eventListener(mockEvent)
    }

    // handler2 should be called even without re-adding listener (useLatest keeps reference updated)
    expect(handler2).toHaveBeenCalledWith(mockEvent)
  })

  it('should handle keyboard events', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener('keydown', handler)
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      expect.any(Object)
    )
  })

  it('should handle mouse events', () => {
    const handler = jest.fn()

    renderHook(() => {
      useEventListener(['mouseenter', 'mouseleave'], handler)
    })

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
  })

  it('should not throw with empty event array', () => {
    const handler = jest.fn()

    expect(() => {
      renderHook(() => {
        useEventListener([], handler)
      })
    }).not.toThrow()
  })

  it('should handle rapid enable/disable toggles', () => {
    const handler = jest.fn()
    addEventListenerSpy.mockClear()
    removeEventListenerSpy.mockClear()

    const { rerender } = renderHook(
      ({ enable }) => {
        useEventListener('click', handler, { enable })
      },
      { initialProps: { enable: true } }
    )

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)

    rerender({ enable: false })
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1)

    rerender({ enable: true })
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2)

    rerender({ enable: false })
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2)
  })
})
