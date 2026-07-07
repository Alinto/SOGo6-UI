import { renderHook } from '@testing-library/react'

// --- Mocks ---

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('lucide-react', () => ({
  Calendar: 'Calendar',
  Contact: 'Contact',
  Mail: 'Mail',
  SettingsIcon: 'SettingsIcon',
  ShieldUser: 'ShieldUser',
  User: 'User',
  UserCog: 'UserCog',
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
    notifyEnabled: true,
    passwordChangeEnabled: true,
    ...overrides,
  })
}

// --- Tests ---

describe('useNavItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // --- Top-level structure ---

  describe('Top-level structure', () => {
    it('returns an array', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(Array.isArray(result.current)).toBe(true)
    })

    it('returns exactly 2 sections', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current).toHaveLength(2)
    })

    it('first section is the account section', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[0].title).toBe('US_SIDEBAR.account.title.string')
    })

    it('second section is the settings section', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].title).toBe('US_SIDEBAR.settings.title.string')
    })

    it('both sections are active', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[0].isActive).toBe(true)
      expect(result.current[1].isActive).toBe(true)
    })

    it('account section has a collapsedIcon', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[0].collapsedIcon).toBeDefined()
    })

    it('settings section has a collapsedIcon', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].collapsedIcon).toBeDefined()
    })
  })

  // --- Account section ---

  describe('Account section', () => {
    it('always includes the Profile item', () => {
      mockProfile({ passwordChangeEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const profileItem = result.current[0].items?.find(
        (i) => i.title === 'US_SIDEBAR.account.profile.string'
      )
      expect(profileItem).toBeDefined()
    })

    it('Profile item has the correct url', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const profileItem = result.current[0].items?.find(
        (i) => i.title === 'US_SIDEBAR.account.profile.string'
      )
      expect(profileItem?.url).toBe('/user_settings/profile')
    })

    it('Profile item has an icon', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const profileItem = result.current[0].items?.find(
        (i) => i.title === 'US_SIDEBAR.account.profile.string'
      )
      expect(profileItem?.icon).toBeDefined()
    })

    it('includes Security item when passwordChangeEnabled is true', () => {
      mockProfile({ passwordChangeEnabled: true })
      const { result } = renderHook(() => useNavItems())
      const securityItem = result.current[0].items?.find(
        (i) => i.title === 'US_SIDEBAR.account.security.string'
      )
      expect(securityItem).toBeDefined()
    })

    it('Security item has the correct url', () => {
      mockProfile({ passwordChangeEnabled: true })
      const { result } = renderHook(() => useNavItems())
      const securityItem = result.current[0].items?.find(
        (i) => i.title === 'US_SIDEBAR.account.security.string'
      )
      expect(securityItem?.url).toBe('/user_settings/security')
    })

    it('Security item has an icon', () => {
      mockProfile({ passwordChangeEnabled: true })
      const { result } = renderHook(() => useNavItems())
      const securityItem = result.current[0].items?.find(
        (i) => i.title === 'US_SIDEBAR.account.security.string'
      )
      expect(securityItem?.icon).toBeDefined()
    })

    it('excludes Security item when passwordChangeEnabled is false', () => {
      mockProfile({ passwordChangeEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const securityItem = result.current[0].items?.find(
        (i) => i.title === 'US_SIDEBAR.account.security.string'
      )
      expect(securityItem).toBeUndefined()
    })

    it('has 2 items when passwordChangeEnabled is true', () => {
      mockProfile({ passwordChangeEnabled: true })
      const { result } = renderHook(() => useNavItems())
      expect(result.current[0].items).toHaveLength(2)
    })

    it('has 1 item when passwordChangeEnabled is false', () => {
      mockProfile({ passwordChangeEnabled: false })
      const { result } = renderHook(() => useNavItems())
      expect(result.current[0].items).toHaveLength(1)
    })
  })

  // --- Settings section top-level items ---

  describe('Settings section top-level items', () => {
    it('has exactly 4 top-level items', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].items).toHaveLength(4)
    })

    it('first item is General with correct url', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[0]
      expect(item?.title).toBe('US_SIDEBAR.settings.general.string')
      expect(item?.url).toBe('/user_settings/general')
    })

    it('General item has icon and collapsedIcon', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[0]
      expect(item?.icon).toBeDefined()
      expect(item?.collapsedIcon).toBeDefined()
    })

    it('second item is Address Books with correct url', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[1]
      expect(item?.title).toBe('US_SIDEBAR.settings.address_books.string')
      expect(item?.url).toBe('/user_settings/address_books')
    })

    it('Address Books item has an icon', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[1]
      expect(item?.icon).toBeDefined()
    })

    it('third item is Calendars subsection', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].items?.[2].title).toBe(
        'US_SIDEBAR.settings.calendars.title.string'
      )
    })

    it('fourth item is Email subsection', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].items?.[3].title).toBe(
        'US_SIDEBAR.settings.email.title.string'
      )
    })
  })

  // --- Calendars subsection ---

  describe('Calendars subsection', () => {
    it('has icon and collapsedIcon', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const calendars = result.current[1].items?.[2]
      expect(calendars?.icon).toBeDefined()
      expect(calendars?.collapsedIcon).toBeDefined()
    })

    it('is active', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].items?.[2].isActive).toBe(true)
    })

    it('has exactly 2 sub-items', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].items?.[2].items).toHaveLength(2)
    })

    it('first sub-item is Calendars General with correct url', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[2].items?.[0]
      expect(item?.title).toBe('US_SIDEBAR.settings.calendars.general.string')
      expect(item?.url).toBe('/user_settings/calendars/general')
    })

    it('second sub-item is Calendars Categories with correct url', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[2].items?.[1]
      expect(item?.title).toBe(
        'US_SIDEBAR.settings.calendars.categories.string'
      )
      expect(item?.url).toBe('/user_settings/calendars/categories')
    })
  })

  // --- Email subsection ---

  describe('Email subsection', () => {
    it('has icon and collapsedIcon', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const email = result.current[1].items?.[3]
      expect(email?.icon).toBeDefined()
      expect(email?.collapsedIcon).toBeDefined()
    })

    it('is active', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].items?.[3].isActive).toBe(true)
    })

    it('always includes General at index 0', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.[0]
      expect(item?.title).toBe('US_SIDEBAR.settings.email.general.string')
      expect(item?.url).toBe('/user_settings/mail/general')
    })

    it('always includes Categories at index 1', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.[1]
      expect(item?.title).toBe('US_SIDEBAR.settings.email.categories.string')
      expect(item?.url).toBe('/user_settings/mail/categories')
    })

    it('always includes IMAP Accounts at index 2', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.[2]
      expect(item?.title).toBe(
        'US_SIDEBAR.settings.email.external_accounts.string'
      )
      expect(item?.url).toBe('/user_settings/mail/external_accounts')
    })

    it('includes Notifications when notifyEnabled is true', () => {
      mockProfile({ notifyEnabled: true })
      const { result } = renderHook(() => useNavItems())
      const items = result.current[1].items?.[3].items ?? []
      const last = items[items.length - 1]
      expect(last?.title).toBe('US_SIDEBAR.settings.email.notifications.string')
      expect(last?.url).toBe('/user_settings/mail/notifications')
    })

    it('excludes Notifications when notifyEnabled is false', () => {
      mockProfile({ notifyEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.find(
        (i) => i.title === 'US_SIDEBAR.settings.email.notifications.string'
      )
      expect(item).toBeUndefined()
    })

    it('has 7 items when all conditional flags are enabled', () => {
      mockProfile({
        forwardEnabled: true,
        vacationEnabled: true,
        mailFilteringEnabled: true,
        notifyEnabled: true,
      })
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].items?.[3].items).toHaveLength(7)
    })

    it('has 3 items when all conditional flags are disabled', () => {
      mockProfile({
        forwardEnabled: false,
        vacationEnabled: false,
        mailFilteringEnabled: false,
        notifyEnabled: false,
      })
      const { result } = renderHook(() => useNavItems())
      expect(result.current[1].items?.[3].items).toHaveLength(3)
    })
  })

  // --- Email conditional items ---

  describe('Email conditional items (mailFilteringEnabled)', () => {
    it('includes Filters when mailFilteringEnabled is true', () => {
      mockProfile({ mailFilteringEnabled: true })
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.find(
        (i) => i.title === 'US_SIDEBAR.settings.email.filters.string'
      )
      expect(item).toBeDefined()
      expect(item?.url).toBe('/user_settings/mail/filters')
    })

    it('excludes Filters when mailFilteringEnabled is false', () => {
      mockProfile({ mailFilteringEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.find(
        (i) => i.title === 'US_SIDEBAR.settings.email.filters.string'
      )
      expect(item).toBeUndefined()
    })
  })

  describe('Email conditional items (vacationEnabled)', () => {
    it('includes Vacation when vacationEnabled is true', () => {
      mockProfile({ vacationEnabled: true })
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.find(
        (i) => i.title === 'US_SIDEBAR.settings.email.vacation.string'
      )
      expect(item).toBeDefined()
      expect(item?.url).toBe('/user_settings/mail/vacation')
    })

    it('excludes Vacation when vacationEnabled is false', () => {
      mockProfile({ vacationEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.find(
        (i) => i.title === 'US_SIDEBAR.settings.email.vacation.string'
      )
      expect(item).toBeUndefined()
    })
  })

  describe('Email conditional items (forwardEnabled)', () => {
    it('includes Forward when forwardEnabled is true', () => {
      mockProfile({ forwardEnabled: true })
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.find(
        (i) => i.title === 'US_SIDEBAR.settings.email.forward.string'
      )
      expect(item).toBeDefined()
      expect(item?.url).toBe('/user_settings/mail/forward')
    })

    it('excludes Forward when forwardEnabled is false', () => {
      mockProfile({ forwardEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const item = result.current[1].items?.[3].items?.find(
        (i) => i.title === 'US_SIDEBAR.settings.email.forward.string'
      )
      expect(item).toBeUndefined()
    })
  })

  // --- Memoisation ---

  describe('Memoisation', () => {
    it('returns the same reference when profile values do not change', () => {
      mockProfile()
      const { result, rerender } = renderHook(() => useNavItems())
      const first = result.current
      rerender()
      expect(result.current).toBe(first)
    })

    it('returns a new reference when passwordChangeEnabled changes', () => {
      mockProfile({ passwordChangeEnabled: true })
      const { result, rerender } = renderHook(() => useNavItems())
      const first = result.current

      mockProfile({ passwordChangeEnabled: false })
      rerender()

      expect(result.current).not.toBe(first)
    })

    it('returns a new reference when forwardEnabled changes', () => {
      mockProfile({ forwardEnabled: true })
      const { result, rerender } = renderHook(() => useNavItems())
      const first = result.current

      mockProfile({ forwardEnabled: false })
      rerender()

      expect(result.current).not.toBe(first)
    })

    it('returns a new reference when vacationEnabled changes', () => {
      mockProfile({ vacationEnabled: true })
      const { result, rerender } = renderHook(() => useNavItems())
      const first = result.current

      mockProfile({ vacationEnabled: false })
      rerender()

      expect(result.current).not.toBe(first)
    })

    it('returns a new reference when mailFilteringEnabled changes', () => {
      mockProfile({ mailFilteringEnabled: true })
      const { result, rerender } = renderHook(() => useNavItems())
      const first = result.current

      mockProfile({ mailFilteringEnabled: false })
      rerender()

      expect(result.current).not.toBe(first)
    })

    it('returns a new reference when notifyEnabled changes', () => {
      mockProfile({ notifyEnabled: true })
      const { result, rerender } = renderHook(() => useNavItems())
      const first = result.current

      mockProfile({ notifyEnabled: false })
      rerender()

      expect(result.current).not.toBe(first)
    })
  })
})
