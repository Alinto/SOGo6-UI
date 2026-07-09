import { renderHook } from '@testing-library/react'
import { useListToolbarMode } from '../use-list-toolbar-mode'

jest.mock('@/features/app-data/store/user-preferences-api', () => ({
  useGetPreferencesQuery: jest.fn(() => ({
    data: { layoutType: 'modern' },
  })),
}))

jest.mock('@/features/mails/hooks/use-mail-detail-navigation', () => ({
  useMailDetailNavigation: jest.fn(() => ({
    isOnMailDetailPath: false,
  })),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: jest.fn((fn: (s: { mailLayout: { mode: string } }) => string) =>
    fn({ mailLayout: { mode: 'full' } })
  ),
}))

describe('useListToolbarMode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { useIsMobile } = require('@/hooks/use-mobile')
    const { useMailDetailNavigation } = require('@/features/mails/hooks/use-mail-detail-navigation')
    const { useGetPreferencesQuery } = require('@/features/app-data/store/user-preferences-api')
    const { useAppSelector } = require('@/lib/redux/hooks')

    useIsMobile.mockReturnValue(false)
    useMailDetailNavigation.mockReturnValue({ isOnMailDetailPath: false })
    useGetPreferencesQuery.mockReturnValue({ data: { layoutType: 'modern' } })
    useAppSelector.mockImplementation((fn: (s: { mailLayout: { mode: string } }) => string) =>
      fn({ mailLayout: { mode: 'full' } })
    )
  })

  it('returns list mode on folder list view', () => {
    const { result } = renderHook(() => useListToolbarMode())
    expect(result.current).toBe('list')
  })

  it('returns hidden on desktop full-screen mail detail', () => {
    const { useMailDetailNavigation } = require('@/features/mails/hooks/use-mail-detail-navigation')
    useMailDetailNavigation.mockReturnValue({ isOnMailDetailPath: true })

    const { result } = renderHook(() => useListToolbarMode())
    expect(result.current).toBe('hidden')
  })

  it('returns detail-navigation on mobile mail detail', () => {
    const { useIsMobile } = require('@/hooks/use-mobile')
    const { useMailDetailNavigation } = require('@/features/mails/hooks/use-mail-detail-navigation')
    useIsMobile.mockReturnValue(true)
    useMailDetailNavigation.mockReturnValue({ isOnMailDetailPath: true })

    const { result } = renderHook(() => useListToolbarMode())
    expect(result.current).toBe('detail-navigation')
  })

  it('returns list mode on split layout even on mail detail', () => {
    const { useIsMobile } = require('@/hooks/use-mobile')
    const { useMailDetailNavigation } = require('@/features/mails/hooks/use-mail-detail-navigation')
    const { useAppSelector } = require('@/lib/redux/hooks')
    useIsMobile.mockReturnValue(false)
    useMailDetailNavigation.mockReturnValue({ isOnMailDetailPath: true })
    useAppSelector.mockImplementation((fn: (s: { mailLayout: { mode: string } }) => string) =>
      fn({ mailLayout: { mode: 'split' } })
    )

    const { result } = renderHook(() => useListToolbarMode())
    expect(result.current).toBe('list')
  })

  it('returns list mode on classic layout even on mail detail', () => {
    const { useGetPreferencesQuery } = require('@/features/app-data/store/user-preferences-api')
    const { useMailDetailNavigation } = require('@/features/mails/hooks/use-mail-detail-navigation')
    useGetPreferencesQuery.mockReturnValue({ data: { layoutType: 'classic' } })
    useMailDetailNavigation.mockReturnValue({ isOnMailDetailPath: true })

    const { result } = renderHook(() => useListToolbarMode())
    expect(result.current).toBe('list')
  })
})
