import { renderHook, waitFor } from '@testing-library/react'
import { useInstallPrompt } from '../use-install-prompt'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
})

describe('useInstallPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset window events
    window.removeEventListener = jest.fn()
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current).toBeDefined()
    expect(typeof result.current.isInstallable).toBe('boolean')
    expect(typeof result.current.isInstalled).toBe('boolean')
    expect(typeof result.current.install).toBe('function')
  })

  it('should have isInstallable as false initially', () => {
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isInstallable).toBe(false)
  })

  it('should have install function', () => {
    const { result } = renderHook(() => useInstallPrompt())
    expect(typeof result.current.install).toBe('function')
  })
})
