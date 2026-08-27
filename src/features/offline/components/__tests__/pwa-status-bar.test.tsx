/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import PwaStatusBar from '../pwa-status-bar'

let mockIsOnline = true

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../flags', () => ({
  isPwaEnabled: () => true,
}))

jest.mock('../../network/use-network-status', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline, isProbing: false }),
}))

jest.mock('../install-pwa-prompt', () => ({
  __esModule: true,
  default: () => <div data-testid="install-pwa-prompt">install</div>,
}))

describe('PwaStatusBar', () => {
  beforeEach(() => {
    mockIsOnline = true
  })

  it('shows the install prompt while online', () => {
    render(<PwaStatusBar />)
    expect(screen.getByTestId('install-pwa-prompt')).toBeInTheDocument()
    expect(screen.queryByText('offline_banner.string')).not.toBeInTheDocument()
  })

  it('shows the offline banner instead of install while offline', () => {
    mockIsOnline = false
    render(<PwaStatusBar />)
    expect(screen.getByText('offline_banner.string')).toBeInTheDocument()
    expect(screen.queryByTestId('install-pwa-prompt')).not.toBeInTheDocument()
  })
})
