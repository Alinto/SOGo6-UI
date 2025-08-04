import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

// Mock window.matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
})

describe('useIsMobile', () => {
  let mockMediaQueryList: {
    matches: boolean
    addEventListener: jest.Mock
    removeEventListener: jest.Mock
  }

  beforeEach(() => {
    mockMediaQueryList = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMediaQueryList)

    // Reset window.innerWidth to desktop size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return false for desktop screen sizes', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should return true for mobile screen sizes', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 600,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return true for screen width exactly at mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 767, // Just below 768px breakpoint
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return false for screen width exactly at desktop breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 768, // Exactly at breakpoint
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should call matchMedia with correct query', () => {
    renderHook(() => useIsMobile())

    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })

  it('should add event listener for media query changes', () => {
    renderHook(() => useIsMobile())

    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())

    unmount()

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should update when window resizes', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())

    // Initially should be false (desktop)
    expect(result.current).toBe(false)

    // Simulate window resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 600,
      })

      // Get the change handler that was added
      const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1]
      changeHandler()
    })

    expect(result.current).toBe(true)
  })

  it('should update when window resizes from mobile to desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 600,
    })

    const { result } = renderHook(() => useIsMobile())

    // Initially should be true (mobile)
    expect(result.current).toBe(true)

    // Simulate window resize to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      })

      // Get the change handler that was added
      const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1]
      changeHandler()
    })

    expect(result.current).toBe(false)
  })

  it('should handle undefined initial state gracefully', () => {
    const { result } = renderHook(() => useIsMobile())

    // The hook should always return a boolean, never undefined
    expect(typeof result.current).toBe('boolean')
  })

  it('should work with different mobile breakpoints', () => {
    // Test common mobile device widths
    const mobileWidths = [320, 375, 414, 600, 767]

    mobileWidths.forEach((width) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: width,
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)
    })
  })

  it('should work with different desktop breakpoints', () => {
    // Test common desktop device widths
    const desktopWidths = [768, 1024, 1280, 1440, 1920]

    desktopWidths.forEach((width) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: width,
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    })
  })
})
