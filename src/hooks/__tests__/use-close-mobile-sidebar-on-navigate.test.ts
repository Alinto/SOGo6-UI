import { renderHook } from '@testing-library/react'
import { useCloseMobileSidebarOnNavigate } from '../use-close-mobile-sidebar-on-navigate'

const mockSetOpenMobile = jest.fn()
const mockSetOpen = jest.fn()
let mockIsCompact = false
let mockPathname = '/u/0/INBOX'
let mockIsMobile = true

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({
    setOpenMobile: mockSetOpenMobile,
    setOpen: mockSetOpen,
    isCompact: mockIsCompact,
  }),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => mockPathname,
}))

describe('useCloseMobileSidebarOnNavigate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname = '/u/0/INBOX'
    mockIsMobile = true
    mockIsCompact = false
  })

  it('does not close on initial mount', () => {
    renderHook(() => useCloseMobileSidebarOnNavigate())

    expect(mockSetOpenMobile).not.toHaveBeenCalled()
  })

  it('closes when pathname changes on mobile', () => {
    const { rerender } = renderHook(() => useCloseMobileSidebarOnNavigate())

    mockPathname = '/tasks'
    rerender()

    expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
  })

  it('does not close when pathname changes on desktop', () => {
    mockIsMobile = false

    const { rerender } = renderHook(() => useCloseMobileSidebarOnNavigate())

    mockPathname = '/tasks'
    rerender()

    expect(mockSetOpenMobile).not.toHaveBeenCalled()
  })

  it('does not close when only rerendering without pathname change', () => {
    const { rerender } = renderHook(() => useCloseMobileSidebarOnNavigate())

    rerender()
    rerender()

    expect(mockSetOpenMobile).not.toHaveBeenCalled()
  })

  it('collapses a menu expanded over its icon rail (tablet) on navigation', () => {
    mockIsMobile = false
    mockIsCompact = true
    const { rerender } = renderHook(() => useCloseMobileSidebarOnNavigate())

    expect(mockSetOpen).not.toHaveBeenCalled()
    mockPathname = '/tasks'
    rerender()

    expect(mockSetOpen).toHaveBeenCalledWith(false)
    expect(mockSetOpenMobile).not.toHaveBeenCalled()
  })

  it('leaves the desktop menu as it is on navigation', () => {
    mockIsMobile = false
    const { rerender } = renderHook(() => useCloseMobileSidebarOnNavigate())

    mockPathname = '/tasks'
    rerender()

    expect(mockSetOpen).not.toHaveBeenCalled()
  })
})
