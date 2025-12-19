import { act, renderHook } from '@testing-library/react'
import { useBoolean } from '../use-boolean'
import { useEventListener } from '../use-event-listener'
import { useHover } from '../use-hover'

jest.mock('../use-boolean')
jest.mock('../use-event-listener')

describe('useHover', () => {
  let mockSetTrue: jest.Mock
  let mockSetFalse: jest.Mock
  let mockAddEventListener: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockSetTrue = jest.fn()
    mockSetFalse = jest.fn()

    // Mock useBoolean to return state and actions
    ;(useBoolean as jest.Mock).mockReturnValue([
      false,
      { setTrue: mockSetTrue, setFalse: mockSetFalse },
    ])

    mockAddEventListener = jest.fn()
    ;(useEventListener as jest.Mock).mockImplementation(mockAddEventListener)
  })

  it('should be a function', () => {
    expect(typeof useHover).toBe('function')
  })

  it('should return initial state as false', () => {
    const target = document.createElement('div')

    const { result } = renderHook(() => useHover(target))

    expect(result.current).toBe(false)
  })

  it('should call useBoolean with false', () => {
    const target = document.createElement('div')

    renderHook(() => useHover(target))

    expect(useBoolean).toHaveBeenCalledWith(false)
  })

  it('should register mouseenter event listener', () => {
    const target = document.createElement('div')

    renderHook(() => useHover(target))

    expect(useEventListener).toHaveBeenCalledWith(
      'mouseenter',
      expect.any(Function),
      expect.objectContaining({ target })
    )
  })

  it('should register mouseleave event listener', () => {
    const target = document.createElement('div')

    renderHook(() => useHover(target))

    expect(useEventListener).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function),
      expect.objectContaining({ target })
    )
  })

  it('should call setTrue on mouseenter', () => {
    const target = document.createElement('div')

    renderHook(() => useHover(target))

    // Get the mouseenter handler
    const mouseenterCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseenter'
    )
    const mouseenterHandler = mouseenterCall[1]

    act(() => {
      mouseenterHandler()
    })

    expect(mockSetTrue).toHaveBeenCalled()
  })

  it('should call setFalse on mouseleave', () => {
    const target = document.createElement('div')

    renderHook(() => useHover(target))

    // Get the mouseleave handler
    const mouseleaveCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseleave'
    )
    const mouseleaveHandler = mouseleaveCall[1]

    act(() => {
      mouseleaveHandler()
    })

    expect(mockSetFalse).toHaveBeenCalled()
  })

  it('should call onEnter callback on mouseenter', () => {
    const target = document.createElement('div')
    const onEnter = jest.fn()

    renderHook(() => useHover(target, { onEnter }))

    const mouseenterCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseenter'
    )
    const mouseenterHandler = mouseenterCall[1]

    act(() => {
      mouseenterHandler()
    })

    expect(onEnter).toHaveBeenCalled()
  })

  it('should call onLeave callback on mouseleave', () => {
    const target = document.createElement('div')
    const onLeave = jest.fn()

    renderHook(() => useHover(target, { onLeave }))

    const mouseleaveCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseleave'
    )
    const mouseleaveHandler = mouseleaveCall[1]

    act(() => {
      mouseleaveHandler()
    })

    expect(onLeave).toHaveBeenCalled()
  })

  it('should call onChange with true on mouseenter', () => {
    const target = document.createElement('div')
    const onChange = jest.fn()

    renderHook(() => useHover(target, { onChange }))

    const mouseenterCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseenter'
    )
    const mouseenterHandler = mouseenterCall[1]

    act(() => {
      mouseenterHandler()
    })

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('should call onChange with false on mouseleave', () => {
    const target = document.createElement('div')
    const onChange = jest.fn()

    renderHook(() => useHover(target, { onChange }))

    const mouseleaveCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseleave'
    )
    const mouseleaveHandler = mouseleaveCall[1]

    act(() => {
      mouseleaveHandler()
    })

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('should call callbacks in correct order on mouseenter', () => {
    const target = document.createElement('div')
    const callOrder: string[] = []
    const onEnter = jest.fn(() => callOrder.push('onEnter'))
    const onChange = jest.fn(() => callOrder.push('onChange'))

    renderHook(() => useHover(target, { onEnter, onChange }))

    const mouseenterCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseenter'
    )
    const mouseenterHandler = mouseenterCall[1]

    act(() => {
      mouseenterHandler()
    })

    expect(callOrder).toEqual(['onEnter', 'onChange'])
  })

  it('should call callbacks in correct order on mouseleave', () => {
    const target = document.createElement('div')
    const callOrder: string[] = []
    const onLeave = jest.fn(() => callOrder.push('onLeave'))
    const onChange = jest.fn(() => callOrder.push('onChange'))

    renderHook(() => useHover(target, { onLeave, onChange }))

    const mouseleaveCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseleave'
    )
    const mouseleaveHandler = mouseleaveCall[1]

    act(() => {
      mouseleaveHandler()
    })

    expect(callOrder).toEqual(['onLeave', 'onChange'])
  })

  it('should work without options', () => {
    const target = document.createElement('div')

    const { result } = renderHook(() => useHover(target))

    expect(result.current).toBe(false)
    expect(useEventListener).toHaveBeenCalledTimes(2)
  })

  it('should work with partial options', () => {
    const target = document.createElement('div')
    const onEnter = jest.fn()

    renderHook(() => useHover(target, { onEnter }))

    const mouseenterCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseenter'
    )
    const mouseenterHandler = mouseenterCall[1]

    act(() => {
      mouseenterHandler()
    })

    expect(onEnter).toHaveBeenCalled()
  })

  it('should accept window as target', () => {
    renderHook(() => useHover(window))

    expect(useEventListener).toHaveBeenCalledWith(
      'mouseenter',
      expect.any(Function),
      expect.objectContaining({ target: window })
    )
  })

  it('should accept document as target', () => {
    renderHook(() => useHover(document))

    expect(useEventListener).toHaveBeenCalledWith(
      'mouseenter',
      expect.any(Function),
      expect.objectContaining({ target: document })
    )
  })

  it('should handle multiple instances independently', () => {
    const target1 = document.createElement('div')
    const target2 = document.createElement('div')
    const onChange1 = jest.fn()
    const onChange2 = jest.fn()

    renderHook(() => useHover(target1, { onChange: onChange1 }))
    renderHook(() => useHover(target2, { onChange: onChange2 }))

    expect(useEventListener).toHaveBeenCalledTimes(4) // 2 hooks × 2 listeners each
  })

  it('should register listeners with correct target', () => {
    const target = document.createElement('div')

    renderHook(() => useHover(target))

    const calls = (useEventListener as jest.Mock).mock.calls
    expect(calls[0][2]).toEqual({ target })
    expect(calls[1][2]).toEqual({ target })
  })

  it('should not require onEnter callback', () => {
    const target = document.createElement('div')

    const { result } = renderHook(() =>
      useHover(target, { onLeave: jest.fn() })
    )

    const mouseenterCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseenter'
    )
    const mouseenterHandler = mouseenterCall[1]

    expect(() => {
      act(() => {
        mouseenterHandler()
      })
    }).not.toThrow()
  })

  it('should not require onLeave callback', () => {
    const target = document.createElement('div')

    const { result } = renderHook(() =>
      useHover(target, { onEnter: jest.fn() })
    )

    const mouseleaveCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseleave'
    )
    const mouseleaveHandler = mouseleaveCall[1]

    expect(() => {
      act(() => {
        mouseleaveHandler()
      })
    }).not.toThrow()
  })

  it('should not require onChange callback', () => {
    const target = document.createElement('div')

    const { result } = renderHook(() =>
      useHover(target, { onEnter: jest.fn() })
    )

    const mouseleaveCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseleave'
    )
    const mouseleaveHandler = mouseleaveCall[1]

    expect(() => {
      act(() => {
        mouseleaveHandler()
      })
    }).not.toThrow()
  })

  it('should handle mouseenter and mouseleave sequence', () => {
    const target = document.createElement('div')
    const onChange = jest.fn()

    renderHook(() => useHover(target, { onChange }))

    const mouseenterCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseenter'
    )
    const mouseleaveCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseleave'
    )

    const mouseenterHandler = mouseenterCall[1]
    const mouseleaveHandler = mouseleaveCall[1]

    act(() => {
      mouseenterHandler()
    })

    expect(onChange).toHaveBeenLastCalledWith(true)

    act(() => {
      mouseleaveHandler()
    })

    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it('should handle repeated hover events', () => {
    const target = document.createElement('div')
    const onChange = jest.fn()

    renderHook(() => useHover(target, { onChange }))

    const mouseenterCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseenter'
    )
    const mouseleaveCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseleave'
    )

    const mouseenterHandler = mouseenterCall[1]
    const mouseleaveHandler = mouseleaveCall[1]

    act(() => {
      mouseenterHandler()
      mouseleaveHandler()
      mouseenterHandler()
      mouseleaveHandler()
    })

    expect(onChange).toHaveBeenCalledTimes(4)
    expect(onChange).toHaveBeenNthCalledWith(1, true)
    expect(onChange).toHaveBeenNthCalledWith(2, false)
    expect(onChange).toHaveBeenNthCalledWith(3, true)
    expect(onChange).toHaveBeenNthCalledWith(4, false)
  })

  it('should call all callbacks on mouseenter', () => {
    const target = document.createElement('div')
    const onEnter = jest.fn()
    const onChange = jest.fn()

    renderHook(() => useHover(target, { onEnter, onChange }))

    const mouseenterCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseenter'
    )
    const mouseenterHandler = mouseenterCall[1]

    act(() => {
      mouseenterHandler()
    })

    expect(onEnter).toHaveBeenCalledTimes(1)
    expect(mockSetTrue).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should call all callbacks on mouseleave', () => {
    const target = document.createElement('div')
    const onLeave = jest.fn()
    const onChange = jest.fn()

    renderHook(() => useHover(target, { onLeave, onChange }))

    const mouseleaveCall = (useEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'mouseleave'
    )
    const mouseleaveHandler = mouseleaveCall[1]

    act(() => {
      mouseleaveHandler()
    })

    expect(onLeave).toHaveBeenCalledTimes(1)
    expect(mockSetFalse).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
