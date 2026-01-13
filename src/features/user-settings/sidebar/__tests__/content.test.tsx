import navItems from '../content'

describe('navItems', () => {
  it('should export an array of navigation items', () => {
    expect(Array.isArray(navItems)).toBe(true)
    expect(navItems).toHaveLength(2)
  })

  it('should have account section with correct structure', () => {
    const accountSection = navItems[0]
    expect(accountSection.title).toBe('US_SIDEBAR.account.title.string')
    expect(accountSection.isActive).toBe(true)
    expect(accountSection.collapsedIcon).toBeDefined()
    expect(accountSection.items).toHaveLength(2)

    const profileItem = accountSection.items[0]
    expect(profileItem.title).toBe('US_SIDEBAR.account.profile.string')
    expect(profileItem.url).toBe('/user_settings/profile')
    expect(profileItem.icon).toBeDefined()

    const securityItem = accountSection.items[1]
    expect(securityItem.title).toBe('US_SIDEBAR.account.security.string')
    expect(securityItem.url).toBe('/user_settings/security')
    expect(securityItem.icon).toBeDefined()
  })

  it('should have settings section with correct structure', () => {
    const settingsSection = navItems[1]
    expect(settingsSection.title).toBe('US_SIDEBAR.settings.title.string')
    expect(settingsSection.isActive).toBe(true)
    expect(settingsSection.collapsedIcon).toBeDefined()
    expect(settingsSection.items).toHaveLength(4)

    // General settings
    const generalItem = settingsSection.items[0]
    expect(generalItem.title).toBe('US_SIDEBAR.settings.general.string')
    expect(generalItem.url).toBe('/user_settings/general')
    expect(generalItem.icon).toBeDefined()
    expect(generalItem.collapsedIcon).toBeDefined()

    // Address books
    const addressBooksItem = settingsSection.items[1]
    expect(addressBooksItem.title).toBe(
      'US_SIDEBAR.settings.address_books.string'
    )
    expect(addressBooksItem.url).toBe('/user_settings/address_books')
    expect(addressBooksItem.icon).toBeDefined()

    // Calendars subsection
    const calendarsItem = settingsSection.items[2]
    expect(calendarsItem.title).toBe(
      'US_SIDEBAR.settings.calendars.title.string'
    )
    expect(calendarsItem.icon).toBeDefined()
    expect(calendarsItem.collapsedIcon).toBeDefined()
    expect(calendarsItem.isActive).toBe(true)
    expect(calendarsItem.items).toHaveLength(3)

    const calendarsGeneral = calendarsItem.items[0]
    expect(calendarsGeneral.title).toBe(
      'US_SIDEBAR.settings.calendars.general.string'
    )
    expect(calendarsGeneral.url).toBe('/user_settings/calendars/genreral') // Note: there's a typo in the original, 'genreral' instead of 'general'

    const calendarsCategories = calendarsItem.items[1]
    expect(calendarsCategories.title).toBe(
      'US_SIDEBAR.settings.calendars.categories.string'
    )
    expect(calendarsCategories.url).toBe('/user_settings/calendars/categories')

    const calendarsInvitations = calendarsItem.items[2]
    expect(calendarsInvitations.title).toBe(
      'US_SIDEBAR.settings.calendars.invitations.string'
    )
    expect(calendarsInvitations.url).toBe(
      '/user_settings/calendars/invitations'
    )

    // Email subsection
    const emailItem = settingsSection.items[3]
    expect(emailItem.title).toBe('US_SIDEBAR.settings.email.title.string')
    expect(emailItem.icon).toBeDefined()
    expect(emailItem.collapsedIcon).toBeDefined()
    expect(emailItem.isActive).toBe(true)
    expect(emailItem.items).toHaveLength(7)

    const emailItems = emailItem.items
    expect(emailItems[0].title).toBe('US_SIDEBAR.settings.email.general.string')
    expect(emailItems[0].url).toBe('/user_settings/mail/general')

    expect(emailItems[1].title).toBe('US_SIDEBAR.settings.email.labels.string')
    expect(emailItems[1].url).toBe('/user_settings/mail/labels')

    expect(emailItems[2].title).toBe(
      'US_SIDEBAR.settings.email.imap_accounts.string'
    )
    expect(emailItems[2].url).toBe('/user_settings/mail/imap_accounts')

    expect(emailItems[3].title).toBe('US_SIDEBAR.settings.email.filters.string')
    expect(emailItems[3].url).toBe('/user_settings/mail/filters')

    expect(emailItems[4].title).toBe(
      'US_SIDEBAR.settings.email.vacation.string'
    )
    expect(emailItems[4].url).toBe('/user_settings/mail/vacation')

    expect(emailItems[5].title).toBe('US_SIDEBAR.settings.email.forward.string')
    expect(emailItems[5].url).toBe('/user_settings/mail/forward')

    expect(emailItems[6].title).toBe(
      'US_SIDEBAR.settings.email.notifications.string'
    )
    expect(emailItems[6].url).toBe('/user_settings/mail/notifications')
  })
})
