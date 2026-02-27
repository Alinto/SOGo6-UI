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

  describe('Settings section structure', () => {
    it('should have all 4 top-level settings items', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const settingsSection = result.current[1]
      expect(settingsSection.items).toHaveLength(4)
    })

    it('should have correct general and address_books items', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const settingsSection = result.current[1]

      const generalItem = settingsSection.items[0]
      expect(generalItem.title).toBe('US_SIDEBAR.settings.general.string')
      expect(generalItem.url).toBe('/user_settings/general')
      expect(generalItem.icon).toBeDefined()

      const addressBooksItem = settingsSection.items[1]
      expect(addressBooksItem.title).toBe(
        'US_SIDEBAR.settings.address_books.string'
      )
      expect(addressBooksItem.url).toBe('/user_settings/address_books')
    })

    it('should have correct calendars subsection', () => {
      mockProfile()
      const { result } = renderHook(() => useNavItems())
      const settingsSection = result.current[1]

      const calendarsItem = settingsSection.items[2]
      expect(calendarsItem.title).toBe(
        'US_SIDEBAR.settings.calendars.title.string'
      )
      expect(calendarsItem.icon).toBeDefined()
      expect(calendarsItem.collapsedIcon).toBeDefined()
      expect(calendarsItem.isActive).toBe(true)
      expect(calendarsItem.items).toHaveLength(2)

      const calendarsGeneral = calendarsItem.items[0]
      expect(calendarsGeneral.title).toBe(
        'US_SIDEBAR.settings.calendars.general.string'
      )
      expect(calendarsGeneral.url).toBe('/user_settings/calendars/general')

      const calendarsCategories = calendarsItem.items[1]
      expect(calendarsCategories.title).toBe(
        'US_SIDEBAR.settings.calendars.categories.string'
      )
      expect(calendarsCategories.url).toBe(
        '/user_settings/calendars/categories'
      )
    })

    it('should have correct email subsection with all items when all flags enabled', () => {
      mockProfile({
        forwardEnabled: true,
        vacationEnabled: true,
        mailFilteringEnabled: true,
      })
      const { result } = renderHook(() => useNavItems())
      const settingsSection = result.current[1]

      const emailItem = settingsSection.items[3]
      expect(emailItem.title).toBe('US_SIDEBAR.settings.email.title.string')
      expect(emailItem.icon).toBeDefined()
      expect(emailItem.collapsedIcon).toBeDefined()
      expect(emailItem.isActive).toBe(true)
      // general, categories, labels, imap_accounts, filters, vacation, forward, notifications = 8
      expect(emailItem.items).toHaveLength(8)

      const emailItems = emailItem.items
      expect(emailItems[0].title).toBe(
        'US_SIDEBAR.settings.email.general.string'
      )
      expect(emailItems[0].url).toBe('/user_settings/mail/general')

      expect(emailItems[1].title).toBe(
        'US_SIDEBAR.settings.email.categories.string'
      )
      expect(emailItems[1].url).toBe('/user_settings/mail/categories')

      expect(emailItems[2].title).toBe(
        'US_SIDEBAR.settings.email.labels.string'
      )
      expect(emailItems[2].url).toBe('/user_settings/mail/labels')

      expect(emailItems[3].title).toBe(
        'US_SIDEBAR.settings.email.imap_accounts.string'
      )
      expect(emailItems[3].url).toBe('/user_settings/mail/imap_accounts')

      expect(emailItems[4].title).toBe(
        'US_SIDEBAR.settings.email.filters.string'
      )
      expect(emailItems[4].url).toBe('/user_settings/mail/filters')

      expect(emailItems[5].title).toBe(
        'US_SIDEBAR.settings.email.vacation.string'
      )
      expect(emailItems[5].url).toBe('/user_settings/mail/vacation')

      expect(emailItems[6].title).toBe(
        'US_SIDEBAR.settings.email.forward.string'
      )
      expect(emailItems[6].url).toBe('/user_settings/mail/forward')

      expect(emailItems[7].title).toBe(
        'US_SIDEBAR.settings.email.notifications.string'
      )
      expect(emailItems[7].url).toBe('/user_settings/mail/notifications')
    })
  })

  describe('Email conditional items', () => {
    it('should exclude filters when mailFilteringEnabled is false', () => {
      mockProfile({ mailFilteringEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const emailItems = result.current[1].items[3].items
      const filtersItem = emailItems.find(
        (item: any) => item.title === 'US_SIDEBAR.settings.email.filters.string'
      )
      expect(filtersItem).toBeUndefined()
    })

    it('should exclude vacation when vacationEnabled is false', () => {
      mockProfile({ vacationEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const emailItems = result.current[1].items[3].items
      const vacationItem = emailItems.find(
        (item: any) =>
          item.title === 'US_SIDEBAR.settings.email.vacation.string'
      )
      expect(vacationItem).toBeUndefined()
    })

    it('should exclude forward when forwardEnabled is false', () => {
      mockProfile({ forwardEnabled: false })
      const { result } = renderHook(() => useNavItems())
      const emailItems = result.current[1].items[3].items
      const forwardItem = emailItems.find(
        (item: any) => item.title === 'US_SIDEBAR.settings.email.forward.string'
      )
      expect(forwardItem).toBeUndefined()
    })

    it('should have 5 email items when all conditional flags are false', () => {
      mockProfile({
        forwardEnabled: false,
        vacationEnabled: false,
        mailFilteringEnabled: false,
      })
      const { result } = renderHook(() => useNavItems())
      // general, categories, labels, imap_accounts, notifications = 5
      expect(result.current[1].items[3].items).toHaveLength(5)
    })
  })
})
