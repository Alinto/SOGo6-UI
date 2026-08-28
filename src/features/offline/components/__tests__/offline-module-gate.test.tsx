/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import OfflineModuleGate from '../offline-module-gate'

let mockIsOnline = true
let mockIsProbing = false
let mockPwa = true

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../flags', () => ({
  isPwaEnabled: () => mockPwa,
  isPwaMailCacheEnabled: () => mockPwa,
  isPwaCalendarCacheEnabled: () => false,
}))

jest.mock('../../network/use-network-status', () => ({
  useNetworkStatus: () => ({
    isOnline: mockIsOnline,
    isProbing: mockIsProbing,
  }),
}))

jest.mock('../../offline-nav-context', () => ({
  useOfflineNav: () => ({ view: { kind: 'route' } }),
}))

describe('OfflineModuleGate', () => {
  beforeEach(() => {
    mockIsOnline = true
    mockIsProbing = false
    mockPwa = true
  })

  it('renders children when online', () => {
    render(
      <OfflineModuleGate target="calendar">
        <span>calendar-page</span>
      </OfflineModuleGate>
    )
    expect(screen.getByText('calendar-page')).toBeInTheDocument()
    expect(screen.queryByTestId('offline-unavailable')).not.toBeInTheDocument()
  })

  it('renders the in-app empty state when offline', () => {
    mockIsOnline = false
    render(
      <OfflineModuleGate target="calendar">
        <span>calendar-page</span>
      </OfflineModuleGate>
    )
    expect(screen.queryByText('calendar-page')).not.toBeInTheDocument()
    expect(screen.getByTestId('offline-unavailable')).toHaveAttribute(
      'data-target',
      'calendar'
    )
  })

  it('keeps children while the network probe is in flight', () => {
    mockIsOnline = false
    mockIsProbing = true
    render(
      <OfflineModuleGate target="calendar">
        <span>calendar-page</span>
      </OfflineModuleGate>
    )
    expect(screen.getByText('calendar-page')).toBeInTheDocument()
    expect(screen.queryByTestId('offline-unavailable')).not.toBeInTheDocument()
  })
})
