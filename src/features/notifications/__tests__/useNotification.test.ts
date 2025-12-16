import { useAppDispatch } from '@/lib/redux/hooks'
import { act, renderHook } from '@testing-library/react'
import { addNotification } from '../notifications-slice'
import { useNotification } from '../useNotification'

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(),
}))

jest.mock('../notifications-slice', () => ({
  addNotification: jest.fn((payload) => ({
    type: 'ADD_NOTIFICATION',
    payload,
  })),
}))

describe('useNotification', () => {
  let mockDispatch: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch = jest.fn()
    ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
  })

  it('returns notification methods', () => {
    const { result } = renderHook(() => useNotification())

    expect(result.current).toHaveProperty('notify')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('success')
    expect(result.current).toHaveProperty('info')
  })

  it('notify dispatches addNotification with payload', () => {
    const { result } = renderHook(() => useNotification())

    const payload = {
      type: 'success' as const,
      title: 'Test',
      message: 'Test Message',
      duration: 3000,
    }

    act(() => {
      result.current.notify(payload)
    })

    expect(mockDispatch).toHaveBeenCalledWith(addNotification(payload))
  })

  it('error dispatches error notification', () => {
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.error('Error Title', 'Error Message')
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification({
        type: 'error',
        title: 'Error Title',
        message: 'Error Message',
        duration: 5000,
      })
    )
  })

  it('error uses custom duration', () => {
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.error('Error', 'Message', 7000)
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Message',
        duration: 7000,
      })
    )
  })

  it('success dispatches success notification', () => {
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.success('Success Title', 'Success Message')
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification({
        type: 'success',
        title: 'Success Title',
        message: 'Success Message',
        duration: 5000,
      })
    )
  })

  it('success uses custom duration', () => {
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.success('Success', 'Message', 2000)
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Message',
        duration: 2000,
      })
    )
  })

  it('info dispatches info notification', () => {
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.info('Info Title', 'Info Message')
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification({
        type: 'info',
        title: 'Info Title',
        message: 'Info Message',
        duration: 5000,
      })
    )
  })

  it('info uses custom duration', () => {
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.info('Info', 'Message', 4000)
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      addNotification({
        type: 'info',
        title: 'Info',
        message: 'Message',
        duration: 4000,
      })
    )
  })

  it('can dispatch multiple notifications', () => {
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.success('First', 'First Message')
      result.current.error('Second', 'Second Message')
      result.current.info('Third', 'Third Message')
    })

    expect(mockDispatch).toHaveBeenCalledTimes(3)
  })

  it('default duration is 5000ms for all methods', () => {
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.error('Error', 'Message')
      result.current.success('Success', 'Message')
      result.current.info('Info', 'Message')
    })

    const calls = mockDispatch.mock.calls
    expect(calls[0][0].payload.duration).toBe(5000)
    expect(calls[1][0].payload.duration).toBe(5000)
    expect(calls[2][0].payload.duration).toBe(5000)
  })
})
