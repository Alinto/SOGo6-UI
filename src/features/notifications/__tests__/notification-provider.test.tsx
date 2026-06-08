import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { render, waitFor } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { NotificationProvider } from '../notification-provider'
import { removeNotification } from '../notifications-slice'

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    message: jest.fn(),
  },
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}))

const toastOptionsMatcher = (
  id: string,
  description: string,
  duration: number | undefined
) => ({
  id,
  description,
  duration: duration || undefined,
  onDismiss: expect.any(Function),
})

describe('NotificationProvider', () => {
  let mockDispatch: jest.Mock
  let mockTranslate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch = jest.fn()
    mockTranslate = jest.fn((key) => `translated_${key}`)
    ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(useAppSelector as jest.Mock).mockReturnValue([])
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
  })

  it('renders without crashing', () => {
    const { container } = render(<NotificationProvider />)
    expect(container).toBeTruthy()
  })

  it('returns null (no visual output)', () => {
    const { container } = render(<NotificationProvider />)
    expect(container.firstChild).toBeNull()
  })

  it('shows error toast for error notification', async () => {
    const notification = {
      id: '1',
      type: 'error' as const,
      title: 'Error Title',
      message: 'Error Message',
      duration: 5000,
      timestamp: Date.now(),
      details: '',
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])

    render(<NotificationProvider />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'translated_Error Title',
        toastOptionsMatcher('1', 'translated_Error Message', 5000)
      )
    })
  })

  it('shows success toast for success notification', async () => {
    const notification = {
      id: '1',
      type: 'success' as const,
      title: 'Success Title',
      message: 'Success Message',
      duration: 3000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])

    render(<NotificationProvider />)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'translated_Success Title',
        toastOptionsMatcher('1', 'translated_Success Message', 3000)
      )
    })
  })

  it('shows info toast for info notification', async () => {
    const notification = {
      id: '1',
      type: 'info' as const,
      title: 'Info Title',
      message: 'Info Message',
      duration: 4000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])

    render(<NotificationProvider />)

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith(
        'translated_Info Title',
        toastOptionsMatcher('1', 'translated_Info Message', 4000)
      )
    })
  })

  it('shows default toast for unknown type', async () => {
    const notification = {
      id: '1',
      type: 'unknown' as any,
      title: 'Default Title',
      message: 'Default Message',
      duration: undefined,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])

    render(<NotificationProvider />)

    await waitFor(() => {
      expect(toast.message).toHaveBeenCalledWith(
        'translated_Default Title',
        toastOptionsMatcher('1', 'translated_Default Message', undefined)
      )
    })
  })

  it('dispatches removeNotification on toast dismiss', async () => {
    const notification = {
      id: 'test-123',
      type: 'success' as const,
      title: 'Test',
      message: 'Test Message',
      duration: 3000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])

    render(<NotificationProvider />)

    await waitFor(() => {
      const callArgs = (toast.success as jest.Mock).mock.calls[0]
      const onDismiss = callArgs[1].onDismiss
      onDismiss()
      expect(mockDispatch).toHaveBeenCalledWith(removeNotification('test-123'))
    })
  })

  it('handles notification without duration', async () => {
    const notification = {
      id: '1',
      type: 'info' as const,
      title: 'No Duration',
      message: 'Message',
      duration: undefined,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])

    render(<NotificationProvider />)

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith(
        'translated_No Duration',
        toastOptionsMatcher('1', 'translated_Message', undefined)
      )
    })
  })

  it('handles multiple notifications', async () => {
    const notifications = [
      {
        id: '1',
        type: 'success' as const,
        title: 'Success',
        message: 'Message 1',
        duration: 3000,
        timestamp: Date.now(),
      },
      {
        id: '2',
        type: 'error' as const,
        title: 'Error',
        message: 'Message 2',
        duration: 5000,
        timestamp: Date.now(),
      },
    ]

    ;(useAppSelector as jest.Mock).mockReturnValueOnce(notifications)

    render(<NotificationProvider />)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it('does not show duplicate toast when the effect re-runs with the same notification', async () => {
    const notification = {
      id: 'dedupe-1',
      type: 'success' as const,
      title: 'Success Title',
      message: 'Success Message',
      duration: 3000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValue([notification])

    const { rerender } = render(<NotificationProvider />)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledTimes(1)
    })

    rerender(<NotificationProvider />)

    expect(toast.success).toHaveBeenCalledTimes(1)
  })

  it('schedules auto-removal of notification after duration', async () => {
    jest.useFakeTimers()

    const notification = {
      id: 'auto-remove',
      type: 'info' as const,
      title: 'Auto Remove',
      message: 'This should auto remove',
      duration: 2000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])

    render(<NotificationProvider />)

    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        removeNotification('auto-remove')
      )
    })

    jest.useRealTimers()
  })

  it('renders null when there are no notifications', () => {
    ;(useAppSelector as jest.Mock).mockReturnValueOnce([])
    const { container } = render(<NotificationProvider />)
    expect(container.firstChild).toBeNull()
  })

  it('translates title using NOTIFICATIONS namespace', async () => {
    const notification = {
      id: '1',
      type: 'success' as const,
      title: 'some.title.key',
      message: 'some.message.key',
      duration: 3000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])
    render(<NotificationProvider />)

    await waitFor(() => {
      expect(mockTranslate).toHaveBeenCalledWith('some.title.key')
      expect(mockTranslate).toHaveBeenCalledWith('some.message.key')
    })
  })

  it('uses details as JSX description when details is provided', async () => {
    const notification = {
      id: '1',
      type: 'error' as const,
      title: 'Error Title',
      message: 'Error Message',
      details: 'Some extra detail',
      duration: 5000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])
    render(<NotificationProvider />)

    await waitFor(() => {
      const callArgs = (toast.error as jest.Mock).mock.calls[0]
      const description = callArgs[1].description
      // When details is present, description is JSX (not a plain string)
      expect(description).not.toBe('translated_Error Message')
    })
  })

  it('uses plain translated string as description when details is absent', async () => {
    const notification = {
      id: '1',
      type: 'success' as const,
      title: 'Title',
      message: 'Message',
      details: undefined,
      duration: 3000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])
    render(<NotificationProvider />)

    await waitFor(() => {
      const callArgs = (toast.success as jest.Mock).mock.calls[0]
      const description = callArgs[1].description
      expect(description).toBe('translated_Message')
    })
  })

  it('uses duration || undefined — does not pass 0 as duration', async () => {
    const notification = {
      id: '1',
      type: 'info' as const,
      title: 'Title',
      message: 'Message',
      duration: 0,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])
    render(<NotificationProvider />)

    await waitFor(() => {
      const callArgs = (toast.info as jest.Mock).mock.calls[0]
      expect(callArgs[1].duration).toBeUndefined()
    })
  })

  it('does not schedule auto-removal when duration is 0', async () => {
    jest.useFakeTimers()

    const notification = {
      id: 'no-auto-remove',
      type: 'info' as const,
      title: 'Title',
      message: 'Message',
      duration: 0,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])
    render(<NotificationProvider />)

    jest.advanceTimersByTime(10000)

    expect(mockDispatch).not.toHaveBeenCalledWith(
      removeNotification('no-auto-remove')
    )

    jest.useRealTimers()
  })

  it('does not schedule auto-removal when duration is undefined', async () => {
    jest.useFakeTimers()

    const notification = {
      id: 'no-duration',
      type: 'error' as const,
      title: 'Title',
      message: 'Message',
      duration: undefined,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])
    render(<NotificationProvider />)

    jest.advanceTimersByTime(10000)

    expect(mockDispatch).not.toHaveBeenCalledWith(
      removeNotification('no-duration')
    )

    jest.useRealTimers()
  })

  it('dispatches removeNotification on dismiss for error toast', async () => {
    const notification = {
      id: 'error-dismiss',
      type: 'error' as const,
      title: 'Title',
      message: 'Message',
      duration: 5000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])
    render(<NotificationProvider />)

    await waitFor(() => {
      const callArgs = (toast.error as jest.Mock).mock.calls[0]
      callArgs[1].onDismiss()
      expect(mockDispatch).toHaveBeenCalledWith(
        removeNotification('error-dismiss')
      )
    })
  })

  it('dispatches removeNotification on dismiss for info toast', async () => {
    const notification = {
      id: 'info-dismiss',
      type: 'info' as const,
      title: 'Title',
      message: 'Message',
      duration: 4000,
      timestamp: Date.now(),
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])
    render(<NotificationProvider />)

    await waitFor(() => {
      const callArgs = (toast.info as jest.Mock).mock.calls[0]
      callArgs[1].onDismiss()
      expect(mockDispatch).toHaveBeenCalledWith(
        removeNotification('info-dismiss')
      )
    })
  })
})
