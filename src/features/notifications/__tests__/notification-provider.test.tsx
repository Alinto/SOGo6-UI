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
    }

    ;(useAppSelector as jest.Mock).mockReturnValueOnce([notification])

    render(<NotificationProvider />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('translated_Error Title', {
        description: 'translated_Error Message',
        duration: 5000,
        onDismiss: expect.any(Function),
      })
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
      expect(toast.success).toHaveBeenCalledWith('translated_Success Title', {
        description: 'translated_Success Message',
        duration: 3000,
        onDismiss: expect.any(Function),
      })
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
      expect(toast.info).toHaveBeenCalledWith('translated_Info Title', {
        description: 'translated_Info Message',
        duration: 4000,
        onDismiss: expect.any(Function),
      })
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
      expect(toast.message).toHaveBeenCalledWith('translated_Default Title', {
        description: 'translated_Default Message',
        duration: undefined,
        onDismiss: expect.any(Function),
      })
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
      expect(toast.info).toHaveBeenCalledWith('translated_No Duration', {
        description: 'translated_Message',
        duration: undefined,
        onDismiss: expect.any(Function),
      })
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
})
