import { act, renderHook } from '@testing-library/react'
import { useComposeFloatingWindowState } from '../use-compose-floating-window-state'

describe('useComposeFloatingWindowState', () => {
  it('starts neither minimized nor maximized, and draggable when not mobile', () => {
    const { result } = renderHook(() =>
      useComposeFloatingWindowState({ isMobile: false, isActive: true })
    )

    expect(result.current.isMinimized).toBe(false)
    expect(result.current.isMaximized).toBe(false)
    expect(result.current.showMinimized).toBe(false)
    expect(result.current.isDraggable).toBe(true)
  })

  it('auto-maximizes and is not draggable when isMobile is true from the start', () => {
    const { result } = renderHook(() =>
      useComposeFloatingWindowState({ isMobile: true, isActive: true })
    )

    expect(result.current.isMaximized).toBe(true)
    expect(result.current.isMinimized).toBe(false)
    expect(result.current.isDraggable).toBe(false)
  })

  it('auto-maximizes when isMobile flips from false to true', () => {
    const { result, rerender } = renderHook(
      ({ isMobile }) =>
        useComposeFloatingWindowState({ isMobile, isActive: true }),
      { initialProps: { isMobile: false } }
    )

    act(() => {
      result.current.handleMaximize()
    })
    expect(result.current.isMaximized).toBe(true)

    rerender({ isMobile: true })
    expect(result.current.isMaximized).toBe(true)
    expect(result.current.isMinimized).toBe(false)
  })

  it('resets isMaximized when isMobile flips back to false', () => {
    const { result, rerender } = renderHook(
      ({ isMobile }) =>
        useComposeFloatingWindowState({ isMobile, isActive: true }),
      { initialProps: { isMobile: true } }
    )

    expect(result.current.isMaximized).toBe(true)

    rerender({ isMobile: false })
    expect(result.current.isMaximized).toBe(false)
  })

  it('handleMinimize minimizes, clears maximized state and resets x', () => {
    const { result } = renderHook(() =>
      useComposeFloatingWindowState({ isMobile: false, isActive: true })
    )

    act(() => {
      result.current.handleMaximize()
    })
    act(() => {
      result.current.x.set(120)
    })

    act(() => {
      result.current.handleMinimize()
    })

    expect(result.current.isMinimized).toBe(true)
    expect(result.current.isMaximized).toBe(false)
    expect(result.current.x.get()).toBe(0)
    expect(result.current.showMinimized).toBe(true)
    expect(result.current.isDraggable).toBe(false)
  })

  it('handleRestore clears both minimized and maximized state and resets x', () => {
    const { result } = renderHook(() =>
      useComposeFloatingWindowState({ isMobile: false, isActive: true })
    )

    act(() => {
      result.current.handleMinimize()
    })
    act(() => {
      result.current.x.set(80)
    })

    act(() => {
      result.current.handleRestore()
    })

    expect(result.current.isMinimized).toBe(false)
    expect(result.current.isMaximized).toBe(false)
    expect(result.current.x.get()).toBe(0)
  })

  it('handleMaximize maximizes, clears minimized state and resets x', () => {
    const { result } = renderHook(() =>
      useComposeFloatingWindowState({ isMobile: false, isActive: true })
    )

    act(() => {
      result.current.handleMinimize()
    })
    act(() => {
      result.current.x.set(50)
    })

    act(() => {
      result.current.handleMaximize()
    })

    expect(result.current.isMaximized).toBe(true)
    expect(result.current.isMinimized).toBe(false)
    expect(result.current.x.get()).toBe(0)
    expect(result.current.isDraggable).toBe(false)
  })

  it('showMinimized stays false on mobile even if isMinimized is true', () => {
    const { result } = renderHook(() =>
      useComposeFloatingWindowState({ isMobile: true, isActive: true })
    )

    act(() => {
      result.current.handleMinimize()
    })

    expect(result.current.isMinimized).toBe(true)
    expect(result.current.showMinimized).toBe(false)
  })

  describe('containerClasses', () => {
    it('uses mobile full-screen classes when isMobile is true', () => {
      const { result } = renderHook(() =>
        useComposeFloatingWindowState({ isMobile: true, isActive: true })
      )
      expect(result.current.containerClasses).toContain('fixed inset-0')
      expect(result.current.containerClasses).toContain('h-full w-full')
    })

    it('uses compact classes when minimized', () => {
      const { result } = renderHook(() =>
        useComposeFloatingWindowState({ isMobile: false, isActive: true })
      )
      act(() => result.current.handleMinimize())
      expect(result.current.containerClasses).toContain('h-12 w-80')
    })

    it('uses expanded fixed classes when maximized', () => {
      const { result } = renderHook(() =>
        useComposeFloatingWindowState({ isMobile: false, isActive: true })
      )
      act(() => result.current.handleMaximize())
      expect(result.current.containerClasses).toContain('fixed inset-0')
      expect(result.current.containerClasses).toContain('!m-auto')
    })

    it('uses default floating window size otherwise', () => {
      const { result } = renderHook(() =>
        useComposeFloatingWindowState({ isMobile: false, isActive: true })
      )
      expect(result.current.containerClasses).toContain('h-[550px] w-[540px]')
    })

    it('uses the active z-index/shadow classes when isActive is true', () => {
      const { result } = renderHook(() =>
        useComposeFloatingWindowState({ isMobile: false, isActive: true })
      )
      expect(result.current.containerClasses).toContain('z-50 shadow-2xl')
    })

    it('uses the inactive z-index/opacity classes when isActive is false', () => {
      const { result } = renderHook(() =>
        useComposeFloatingWindowState({ isMobile: false, isActive: false })
      )
      expect(result.current.containerClasses).toContain(
        'z-40 shadow-md opacity-95 hover:opacity-100'
      )
    })
  })
})
