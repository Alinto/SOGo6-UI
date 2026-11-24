import { useSidebar } from '@/components/ui/sidebar'
import { renderHook } from '@testing-library/react'
import { useIsIconRail } from '../use-is-icon-rail'

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: jest.fn(),
}))

const mockSidebar = (state: 'expanded' | 'collapsed', isMobile: boolean) =>
  jest.mocked(useSidebar).mockReturnValue({
    state,
    isMobile,
  } as unknown as ReturnType<typeof useSidebar>)

describe('useIsIconRail', () => {
  it('is true when the sidebar is collapsed on desktop', () => {
    mockSidebar('collapsed', false)

    expect(renderHook(() => useIsIconRail()).result.current).toBe(true)
  })

  it('is false when the sidebar is expanded', () => {
    mockSidebar('expanded', false)

    expect(renderHook(() => useIsIconRail()).result.current).toBe(false)
  })

  it('is false on mobile, even when collapsed', () => {
    mockSidebar('collapsed', true)

    expect(renderHook(() => useIsIconRail()).result.current).toBe(false)
  })
})
