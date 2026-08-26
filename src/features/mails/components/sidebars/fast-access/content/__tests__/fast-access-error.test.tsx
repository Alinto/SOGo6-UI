/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import FastAccessError from '../fast-access-error'

let mockIsOnline = true
let mockIsProbing = false

jest.mock('@/features/offline/network/use-network-status', () => ({
  useNetworkStatus: () => ({
    isOnline: mockIsOnline,
    isProbing: mockIsProbing,
  }),
}))

describe('FastAccessError', () => {
  beforeEach(() => {
    mockIsOnline = true
    mockIsProbing = false
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
  })

  it('shows the online error while connected', () => {
    render(
      <FastAccessError online="Could not load events" offline="Reconnect" />
    )
    expect(screen.getByText('Could not load events')).toBeInTheDocument()
    expect(screen.getByText('Could not load events')).toHaveClass(
      'text-destructive'
    )
  })

  it('shows the offline explanation when disconnected', () => {
    mockIsOnline = false
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    render(
      <FastAccessError online="Could not load events" offline="Reconnect" />
    )
    expect(screen.getByText('Reconnect')).toBeInTheDocument()
    expect(screen.getByText('Reconnect')).toHaveClass('text-muted-foreground')
  })
})
