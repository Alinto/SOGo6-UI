import { renderHook } from '@testing-library/react'

// --- Mocks ---

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

// --- Imports after mocks ---

import { useProfile } from '@/features/user-profile'
import { useNavItems } from '../content'

// --- Helper ---

const mockProfile = (overrides = {}) => {
  ;(useProfile as jest.Mock).mockReturnValue({
    forwardEnabled: true,
    vacationEnabled: true,
    mailFilteringEnabled: true,
    passwordChangeEnabled: true,
    ...overrides,
  })
}

// --- Tests ---

describe('useNavItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return an array of 2 sections', () => {
    mockProfile()
    const { result } = renderHook(() => useNavItems())
    expect(Array.isArray(result.current)).toBe(true)
    expect(result.current).toHaveLength(2)
  })

  it('should have account section as first item', () => {
    mockProfile()
    const { result } = renderHook(() => useNavItems())
    expect(result.current[0].title).toBe('US_SIDEBAR.account.title.string')
  })

  it('should have settings section as second item', () => {
    mockProfile()
    const { result } = renderHook(() => useNavItems())
    expect(result.current[1].title).toBe('US_SIDEBAR.settings.title.string')
  })

  describe('Security item (passwordChangeEnabled)', () => {
    it('should include Security item when passwordChangeEnabled is true', () => {
      mockProfile({ passwordChangeEnabled: true })
      const { result } = renderHook(() => useNavItems())
      const accountItems = result.current[0].items
      const securityItem = accountItems.find(
        (item: any) => item.title === 'US_SIDEBAR.account.security.string'
      )
      expect(securityItem).toBeDefined()
    })

    it('should exclude Security item when passwordChangeEnabled is false', () => {
      mockProfile({ passwordChangeEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const accountItems = result.current[0].items
      const securityItem = accountItems.find(
        (item: any) => item.title === 'US_SIDEBAR.account.security.string'
      )
      expect(securityItem).toBeUndefined()
    })
  })

  describe('Profile item is always present', () => {
    it('should always include Profile item', () => {
      mockProfile({ passwordChangeEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const accountItems = result.current[0].items
      const profileItem = accountItems.find(
        (item: any) => item.title === 'US_SIDEBAR.account.profile.string'
      )
      expect(profileItem).toBeDefined()
      expect(profileItem.url).toBe('/user_settings/profile')
    })
  })
})
