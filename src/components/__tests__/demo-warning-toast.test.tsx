import { render, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { isUsingFakeApi } from '@/lib/env-service'
import { DemoWarningToast } from '../demo-warning-toast'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    warning: jest.fn(),
    dismiss: jest.fn(),
  },
}))

jest.mock('@/lib/env-service', () => ({
  isUsingFakeApi: jest.fn(() => true),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'demo.warning.title.string': 'Demo Version',
      'demo.warning.description.string':
        'You are currently using a demo version of the application. Some features may be limited.',
      'demo.warning.action.string': 'Got it',
    }
    return translations[key] || key
  },
}))

describe('DemoWarningToast', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should render without crashing', () => {
    const { container } = render(<DemoWarningToast />)
    expect(container).toBeInTheDocument()
  })

  it('should display warning toast after 1 second', async () => {
    render(<DemoWarningToast />)

    // Fast-forward time by 1 second
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        'Demo Version',
        expect.objectContaining({
          description:
            'You are currently using a demo version of the application. Some features may be limited.',
          duration: 10000,
          action: {
            label: 'Got it',
            onClick: expect.any(Function),
          },
        })
      )
    })
  })

  it('should not display toast before 1 second', () => {
    render(<DemoWarningToast />)

    // Fast-forward time by 500ms
    jest.advanceTimersByTime(500)

    expect(toast.warning).not.toHaveBeenCalled()
  })

  it('should cleanup timer on unmount', () => {
    const { unmount } = render(<DemoWarningToast />)

    unmount()

    // Fast-forward time by 1 second after unmount
    jest.advanceTimersByTime(1000)

    expect(toast.warning).not.toHaveBeenCalled()
  })

  it('should call toast.dismiss when action button is clicked', async () => {
    render(<DemoWarningToast />)

    // Fast-forward time by 1 second
    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalled()
    })

    // Get the onClick handler from the action
    const callArgs = (toast.warning as jest.Mock).mock.calls[0]
    const actionOnClick = callArgs[1].action.onClick

    // Call the onClick handler
    actionOnClick()

    expect(toast.dismiss).toHaveBeenCalled()
  })

  it('should not display toast when not using fake API', () => {
    ;(isUsingFakeApi as jest.Mock).mockReturnValue(false)

    render(<DemoWarningToast />)
    jest.advanceTimersByTime(1000)

    expect(toast.warning).not.toHaveBeenCalled()
  })
})
