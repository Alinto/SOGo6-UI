/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import SerwistProviderGate from '../serwist-provider-gate'

let mockPwa = false
const mockDisable = jest.fn()
const mockProviderProps = jest.fn()

jest.mock('@/features/offline/flags', () => ({
  isPwaEnabled: () => mockPwa,
}))

jest.mock('@/features/offline/pwa-kill-switch', () => ({
  disableInstalledPwa: () => mockDisable(),
}))

jest.mock('next/dynamic', () => () => {
  function MockSerwistProvider(
    props: Record<string, unknown> & { children: ReactNode }
  ) {
    mockProviderProps(props)
    return <>{props.children}</>
  }
  return MockSerwistProvider
})

describe('SerwistProviderGate', () => {
  beforeEach(() => {
    mockDisable.mockReset()
    mockProviderProps.mockReset()
  })

  it('removes an installed worker when the PWA flag is off', async () => {
    mockPwa = false
    render(
      <SerwistProviderGate>
        <span data-testid="child" />
      </SerwistProviderGate>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    await waitFor(() => expect(mockDisable).toHaveBeenCalled())
    expect(mockProviderProps).not.toHaveBeenCalled()
  })

  it('registers without reload-on-online or cache-on-navigation', () => {
    mockPwa = true
    render(
      <SerwistProviderGate>
        <span data-testid="child" />
      </SerwistProviderGate>
    )
    expect(mockDisable).not.toHaveBeenCalled()
    expect(mockProviderProps).toHaveBeenCalledWith(
      expect.objectContaining({
        swUrl: '/serwist/sw.js',
        reloadOnOnline: false,
        cacheOnNavigation: false,
      })
    )
  })
})
