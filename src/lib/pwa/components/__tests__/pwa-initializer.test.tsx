import { render } from '@testing-library/react'
import PWAInitializer from '../pwa-initializer'

jest.mock('@/lib/pwa/hooks/use-service-worker', () => ({
  useServiceWorker: jest.fn(() => ({
    isSupported: true,
    isRegistered: false,
    registration: null,
    hasUpdate: false,
    error: null,
  })),
}))

describe('PWAInitializer', () => {
  it('should render without crashing', () => {
    const { container } = render(<PWAInitializer />)
    expect(container).toBeDefined()
  })

  it('should call useServiceWorker hook', () => {
    const { useServiceWorker } = require('@/lib/pwa/hooks/use-service-worker')
    render(<PWAInitializer />)
    expect(useServiceWorker).toHaveBeenCalled()
  })

  it('should return null', () => {
    const { container } = render(<PWAInitializer />)
    expect(container.firstChild).toBeNull()
  })
})
