import { renderHook } from '@testing-library/react'
import { useCloseMobileSidebarOnNavigate } from '../use-close-mobile-sidebar-on-navigate'

const mockSetOpenMobile = jest.fn()
let mockPathname = '/u/0/INBOX'
let mockIsMobile = true

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({
    setOpenMobile: mockSetOpenMobile,
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
})
