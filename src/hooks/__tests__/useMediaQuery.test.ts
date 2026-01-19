import { renderHook, waitFor } from '@testing-library/react'
import {
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useMediaQuery,
} from '../useMediaQuery'

const createMatchMedia = (matches: boolean) => {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    window.matchMedia = createMatchMedia(false)
  })

  it('should return false on initial render (SSR)', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('should return true when query matches', async () => {
    window.matchMedia = createMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it('should update when media query changes', async () => {
    let listeners: Array<() => void> = []
    const mockMatchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((_, listener) => {
        listeners.push(listener)
      }),
      removeEventListener: jest.fn((_, listener) => {
        listeners = listeners.filter((l) => l !== listener)
      }),
      dispatchEvent: jest.fn(),
    })

    window.matchMedia = mockMatchMedia as any

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    expect(result.current).toBe(false)

    // Simulate media query change
    window.matchMedia = createMatchMedia(true)
    listeners.forEach((listener) => listener())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })
})

describe('Preset hooks', () => {
  it('useIsMobile should detect mobile', async () => {
    window.matchMedia = createMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it('useIsTablet should detect tablet', async () => {
    window.matchMedia = createMatchMedia(true)
    const { result } = renderHook(() => useIsTablet())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it('useIsDesktop should detect desktop', async () => {
    window.matchMedia = createMatchMedia(true)
    const { result } = renderHook(() => useIsDesktop())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })
})
