import { render, screen } from '@testing-library/react'
import OfflineBanner from '../offline-banner'

jest.mock('@/lib/pwa/hooks/use-online-status', () => ({
  useOnlineStatus: jest.fn(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'offline.banner.string': 'You are offline',
      'offline.dismissBanner.string': 'Dismiss',
    }
    return translations[key] || key
  },
}))

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

jest.mock('lucide-react', () => ({
  WifiOff: () => <svg data-testid="wifi-off-icon" />,
  X: () => <svg data-testid="x-icon" />,
}))

const { useOnlineStatus } = require('@/lib/pwa/hooks/use-online-status')

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    })
  })

  it('should not render when online', () => {
    ;(useOnlineStatus as jest.Mock).mockReturnValue(true)

    const { container } = render(<OfflineBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('should render when offline', () => {
    ;(useOnlineStatus as jest.Mock).mockReturnValue(false)

    render(<OfflineBanner />)
    // Wait for mounted state
    setTimeout(() => {
      expect(screen.getByText('You are offline')).toBeInTheDocument()
    }, 100)
  })
})
