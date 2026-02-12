import { renderHook, waitFor } from '@testing-library/react'
import { useServiceWorker } from '../use-service-worker'

describe('useServiceWorker', () => {
  const mockRegister = jest.fn()
  const mockGetRegistration = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockRegister.mockClear()
    mockGetRegistration.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return initial state', () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        register: mockRegister.mockResolvedValue({
          scope: '/',
          installing: null,
          waiting: null,
          active: null,
          addEventListener: jest.fn(),
        }),
        getRegistration: mockGetRegistration.mockResolvedValue(null),
        controller: null,
      },
    })

    const { result } = renderHook(() => useServiceWorker())

    expect(result.current).toBeDefined()
    expect(typeof result.current.isSupported).toBe('boolean')
    expect(typeof result.current.isRegistered).toBe('boolean')
    expect(result.current.registration).toBeNull()
    expect(typeof result.current.hasUpdate).toBe('boolean')
  })

  it('should return isSupported as false when serviceWorker not available', () => {
    // Save original navigator and serviceWorker
    const originalNavigator = global.navigator
    const originalServiceWorker = navigator.serviceWorker
    
    // Create a new navigator object without serviceWorker property
    // We need to explicitly exclude serviceWorker to make 'serviceWorker' in navigator return false
    const navigatorKeys = Object.keys(originalNavigator) as Array<keyof Navigator>
    const mockNavigator = {} as Navigator
    
    // Copy all properties except serviceWorker
    navigatorKeys.forEach((key) => {
      if (key !== 'serviceWorker') {
        ;(mockNavigator as unknown as Record<string, unknown>)[key] = (originalNavigator as unknown as Record<string, unknown>)[key]
      }
    })
    
    // Replace navigator globally for this test
    Object.defineProperty(global, 'navigator', {
      writable: true,
      configurable: true,
      value: mockNavigator,
    })

    const { result } = renderHook(() => useServiceWorker())
    expect(result.current.isSupported).toBe(false)

    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      writable: true,
      configurable: true,
      value: originalNavigator,
    })
    
    // Restore serviceWorker if it existed
    if (originalServiceWorker !== undefined) {
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        configurable: true,
        value: originalServiceWorker,
      })
    }
  })

  it('should return isSupported as true when serviceWorker is available', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        register: mockRegister.mockResolvedValue({
          scope: '/',
          installing: null,
          waiting: null,
          active: null,
          addEventListener: jest.fn(),
        }),
        getRegistration: mockGetRegistration.mockResolvedValue(null),
        controller: null,
      },
    })

    const { result } = renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true)
    })
  })

  it('should register service worker successfully', async () => {
    const mockRegistration = {
      scope: '/',
      installing: null,
      waiting: null,
      active: null,
      addEventListener: jest.fn(),
    }

    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        register: mockRegister.mockResolvedValue(mockRegistration),
        getRegistration: mockGetRegistration.mockResolvedValue(null),
        controller: null,
      },
    })

    const { result } = renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true)
      expect(result.current.registration).toBe(mockRegistration)
      expect(mockRegister).toHaveBeenCalledWith('/sw.js', { scope: '/' })
    })
  })

  it('should handle registration error', async () => {
    const error = new Error('Registration failed')

    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        register: mockRegister.mockRejectedValue(error),
        getRegistration: mockGetRegistration.mockResolvedValue(null),
        controller: null,
      },
    })

    const { result } = renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(result.current.error).toEqual(error)
      expect(result.current.isRegistered).toBe(false)
    })
  })
})
