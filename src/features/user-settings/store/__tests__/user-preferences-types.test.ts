import type {
  CalendarCategoriesSettings,
  CalendarCategory,
  CalendarGeneralSettings,
  ContactCategory,
  ContactGeneralSettings,
  GeneralSettings,
  MailCategoriesSettings,
  MailCategory,
  MailGeneralSettings,
  TotpSettings,
} from '../user-preferences-types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeGeneralSettings(overrides = {}): GeneralSettings {
  return {
    language: 'en',
    timezone: 'Europe/Paris',
    shortDateStyle: '%m/%d/%Y',
    longDateStyle: '%A, %B %e, %Y',
    timeStyle: '24',
    defaultView: 'mail',
    enableNotifications: true,
    avatarEnabled: false,
    ...overrides,
  }
}

function makeContactCategory(overrides = {}): ContactCategory {
  return { name: 'Work', color: '#3b82f6', isDefault: false, ...overrides }
}

function makeMailGeneralSettings(overrides = {}): MailGeneralSettings {
  return {
    collectUnknownAddresses: false,
    collectUnknownAddressbookName: '',
    mailAllowReceipt: false,
    mailfolderSubscribe: false,
    attachmentPosition: 'above',
    composeMailWindow: 'popup',
    hideInlineAttachments: false,
    countAllUnseen: false,
    sortByThreads: false,
    autoMarkAsReadDelay: 0,
    forwardMessages: 'inline',
    startReply: 'above',
    placeSignature: 'above',
    signOnNew: false,
    signOnReply: false,
    signOnForward: false,
    composeIn: 'html',
    ...overrides,
  }
}

function makeCalendarGeneralSettings(overrides = {}): CalendarGeneralSettings {
  return {
    calendarCreationNotif: false,
    calendarViewFirstDay: 1,
    workdayStartTime: '09:00',
    workdayEndTime: '18:00',
    busyOffHours: false,
    calendarDaysShowed: [1, 2, 3, 4, 5],
    calendarWeekNumberFormat: '%V',
    calendarDefault: 'SOGO_DEFAULT_CALENDAR',
    eventDefaultClass: 'PUBLIC',
    taskDefaultClass: 'PUBLIC',
    journalDefaultClass: 'PUBLIC',
    eventDefaultReminder: '0',
    taskDefaultReminder: '0',
    journalDefaultReminder: '0',
    noInvitation: false,
    noInvitationWhitelist: [],
    doNotSendInvitFromDav: false,
    davForceSyncFromClient: false,
    ...overrides,
  }
}

function makeCalendarCategory(overrides = {}): CalendarCategory {
  return { name: 'Personal', color: '#ef4444', isDefault: false, ...overrides }
}

function makeMailCategory(overrides = {}): MailCategory {
  return { name: 'Inbox', color: '#10b981', isDefault: false, ...overrides }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('user-preferences-types runtime shape validation', () => {
  // ── GeneralSettings ───────────────────────────────────────────────────────

  describe('GeneralSettings', () => {
    it('constructs with all 8 required fields', () => {
      expect(Object.keys(makeGeneralSettings())).toHaveLength(8)
    })

    it('all string fields are strings at runtime', () => {
      const obj = makeGeneralSettings()
      expect(typeof obj.language).toBe('string')
      expect(typeof obj.timezone).toBe('string')
      expect(typeof obj.shortDateStyle).toBe('string')
      expect(typeof obj.longDateStyle).toBe('string')
      expect(typeof obj.timeStyle).toBe('string')
      expect(typeof obj.defaultView).toBe('string')
    })

    it('boolean fields are booleans at runtime', () => {
      const obj = makeGeneralSettings()
      expect(typeof obj.enableNotifications).toBe('boolean')
      expect(typeof obj.avatarEnabled).toBe('boolean')
    })

    it('accepts true and false for enableNotifications', () => {
      expect(
        makeGeneralSettings({ enableNotifications: true }).enableNotifications
      ).toBe(true)
      expect(
        makeGeneralSettings({ enableNotifications: false }).enableNotifications
      ).toBe(false)
    })

    it('accepts true and false for avatarEnabled', () => {
      expect(makeGeneralSettings({ avatarEnabled: true }).avatarEnabled).toBe(
        true
      )
      expect(makeGeneralSettings({ avatarEnabled: false }).avatarEnabled).toBe(
        false
      )
    })

    it('accepts arbitrary string values for string fields', () => {
      const obj = makeGeneralSettings({
        language: 'fr',
        timezone: 'America/New_York',
        defaultView: 'calendar',
      })
      expect(obj.language).toBe('fr')
      expect(obj.timezone).toBe('America/New_York')
      expect(obj.defaultView).toBe('calendar')
    })
  })

  // ── ContactCategory ───────────────────────────────────────────────────────

  describe('ContactCategory', () => {
    it('has correct runtime field types', () => {
      const obj = makeContactCategory()
      expect(typeof obj.name).toBe('string')
      expect(typeof obj.color).toBe('string')
      expect(typeof obj.isDefault).toBe('boolean')
    })

    it('uses camelCase isDefault (not is_default)', () => {
      const obj = makeContactCategory()
      expect('isDefault' in obj).toBe(true)
      expect('is_default' in obj).toBe(false)
    })

    it('accepts isDefault true and false', () => {
      expect(makeContactCategory({ isDefault: true }).isDefault).toBe(true)
      expect(makeContactCategory({ isDefault: false }).isDefault).toBe(false)
    })

    it('has exactly 3 keys', () => {
      expect(Object.keys(makeContactCategory())).toHaveLength(3)
    })
  })

  // ── ContactGeneralSettings ────────────────────────────────────────────────

  describe('ContactGeneralSettings', () => {
    it('constructs with categories and creationNotification', () => {
      const obj: ContactGeneralSettings = {
        categories: [makeContactCategory()],
        creationNotification: false,
      }
      expect(Array.isArray(obj.categories)).toBe(true)
      expect(typeof obj.creationNotification).toBe('boolean')
    })

    it('accepts an empty categories array', () => {
      const obj: ContactGeneralSettings = {
        categories: [],
        creationNotification: false,
      }
      expect(obj.categories).toHaveLength(0)
    })

    it('accepts multiple categories', () => {
      const obj: ContactGeneralSettings = {
        categories: [
          makeContactCategory({ name: 'Work' }),
          makeContactCategory({ name: 'Personal', isDefault: true }),
        ],
        creationNotification: true,
      }
      expect(obj.categories).toHaveLength(2)
      expect(obj.creationNotification).toBe(true)
    })

    it('categories items have correct shape', () => {
      const obj: ContactGeneralSettings = {
        categories: [makeContactCategory()],
        creationNotification: false,
      }
      const [cat] = obj.categories
      expect(typeof cat.name).toBe('string')
      expect(typeof cat.color).toBe('string')
      expect(typeof cat.isDefault).toBe('boolean')
    })
  })

  // ── MailGeneralSettings ───────────────────────────────────────────────────

  describe('MailGeneralSettings', () => {
    it('constructs with all 17 required fields', () => {
      expect(Object.keys(makeMailGeneralSettings())).toHaveLength(17)
    })

    it('all boolean fields are booleans at runtime', () => {
      const obj = makeMailGeneralSettings()
      const boolFields = [
        'collectUnknownAddresses',
        'mailAllowReceipt',
        'mailfolderSubscribe',
        'hideInlineAttachments',
        'countAllUnseen',
        'sortByThreads',
        'signOnNew',
        'signOnReply',
        'signOnForward',
      ]
      for (const field of boolFields) {
        expect(typeof (obj as any)[field]).toBe('boolean')
      }
    })

    it('autoMarkAsReadDelay is a number', () => {
      expect(typeof makeMailGeneralSettings().autoMarkAsReadDelay).toBe(
        'number'
      )
      expect(
        makeMailGeneralSettings({ autoMarkAsReadDelay: 30 }).autoMarkAsReadDelay
      ).toBe(30)
    })

    it('collectUnknownAddressbookName is a string', () => {
      expect(
        typeof makeMailGeneralSettings().collectUnknownAddressbookName
      ).toBe('string')
    })

    it('accepts valid attachmentPosition values', () => {
      expect(
        makeMailGeneralSettings({ attachmentPosition: 'above' })
          .attachmentPosition
      ).toBe('above')
      expect(
        makeMailGeneralSettings({ attachmentPosition: 'below' })
          .attachmentPosition
      ).toBe('below')
    })

    it('accepts valid composeMailWindow values', () => {
      expect(
        makeMailGeneralSettings({ composeMailWindow: 'inline' })
          .composeMailWindow
      ).toBe('inline')
      expect(
        makeMailGeneralSettings({ composeMailWindow: 'popup' })
          .composeMailWindow
      ).toBe('popup')
    })

    it('accepts valid forwardMessages values', () => {
      expect(
        makeMailGeneralSettings({ forwardMessages: 'inline' }).forwardMessages
      ).toBe('inline')
      expect(
        makeMailGeneralSettings({ forwardMessages: 'attachment' })
          .forwardMessages
      ).toBe('attachment')
    })

    it('accepts valid startReply values', () => {
      expect(makeMailGeneralSettings({ startReply: 'above' }).startReply).toBe(
        'above'
      )
      expect(makeMailGeneralSettings({ startReply: 'below' }).startReply).toBe(
        'below'
      )
    })

    it('accepts valid placeSignature values', () => {
      expect(
        makeMailGeneralSettings({ placeSignature: 'above' }).placeSignature
      ).toBe('above')
      expect(
        makeMailGeneralSettings({ placeSignature: 'below' }).placeSignature
      ).toBe('below')
    })

    it('accepts valid composeIn values', () => {
      expect(makeMailGeneralSettings({ composeIn: 'html' }).composeIn).toBe(
        'html'
      )
      expect(makeMailGeneralSettings({ composeIn: 'text' }).composeIn).toBe(
        'text'
      )
    })
  })

  // ── CalendarGeneralSettings ───────────────────────────────────────────────

  describe('CalendarGeneralSettings', () => {
    it('constructs with all 18 required fields', () => {
      expect(Object.keys(makeCalendarGeneralSettings())).toHaveLength(18)
    })

    it('boolean fields are booleans at runtime', () => {
      const obj = makeCalendarGeneralSettings()
      const boolFields = [
        'calendarCreationNotif',
        'busyOffHours',
        'noInvitation',
        'doNotSendInvitFromDav',
        'davForceSyncFromClient',
      ]
      for (const field of boolFields) {
        expect(typeof (obj as any)[field]).toBe('boolean')
      }
    })

    it('calendarViewFirstDay is a number', () => {
      expect(typeof makeCalendarGeneralSettings().calendarViewFirstDay).toBe(
        'number'
      )
      expect(
        makeCalendarGeneralSettings({ calendarViewFirstDay: 0 })
          .calendarViewFirstDay
      ).toBe(0)
    })

    it('calendarDaysShowed is an array of numbers', () => {
      const obj = makeCalendarGeneralSettings({
        calendarDaysShowed: [0, 1, 2, 3, 4, 5, 6],
      })
      expect(Array.isArray(obj.calendarDaysShowed)).toBe(true)
      obj.calendarDaysShowed.forEach((d) => expect(typeof d).toBe('number'))
    })

    it('string fields are strings', () => {
      const obj = makeCalendarGeneralSettings()
      expect(typeof obj.workdayStartTime).toBe('string')
      expect(typeof obj.workdayEndTime).toBe('string')
      expect(typeof obj.calendarDefault).toBe('string')
      expect(typeof obj.eventDefaultReminder).toBe('string')
      expect(typeof obj.taskDefaultReminder).toBe('string')
      expect(typeof obj.journalDefaultReminder).toBe('string')
    })

    it('noInvitationWhitelist is an array of strings', () => {
      const obj = makeCalendarGeneralSettings({
        noInvitationWhitelist: ['a@b.com'],
      })
      expect(Array.isArray(obj.noInvitationWhitelist)).toBe(true)
      expect(typeof obj.noInvitationWhitelist[0]).toBe('string')
    })

    it('accepts all valid calendarWeekNumberFormat values', () => {
      const formats: Array<'%U' | '%W' | '%V'> = ['%U', '%W', '%V']
      for (const fmt of formats) {
        expect(
          makeCalendarGeneralSettings({ calendarWeekNumberFormat: fmt })
            .calendarWeekNumberFormat
        ).toBe(fmt)
      }
    })

    it('accepts all valid class values for event, task, and journal', () => {
      const classes: Array<'PUBLIC' | 'CONFIDENTIAL' | 'PRIVATE'> = [
        'PUBLIC',
        'CONFIDENTIAL',
        'PRIVATE',
      ]
      for (const cls of classes) {
        const obj = makeCalendarGeneralSettings({
          eventDefaultClass: cls,
          taskDefaultClass: cls,
          journalDefaultClass: cls,
        })
        expect(obj.eventDefaultClass).toBe(cls)
        expect(obj.taskDefaultClass).toBe(cls)
        expect(obj.journalDefaultClass).toBe(cls)
      }
    })

    it('accepts arbitrary string reminder values', () => {
      const obj = makeCalendarGeneralSettings({
        eventDefaultReminder: '15',
        taskDefaultReminder: '-1',
        journalDefaultReminder: '60',
      })
      expect(obj.eventDefaultReminder).toBe('15')
      expect(obj.taskDefaultReminder).toBe('-1')
      expect(obj.journalDefaultReminder).toBe('60')
    })
  })

  // ── CalendarCategory ──────────────────────────────────────────────────────

  describe('CalendarCategory', () => {
    it('has correct runtime field types', () => {
      const obj = makeCalendarCategory()
      expect(typeof obj.name).toBe('string')
      expect(typeof obj.color).toBe('string')
      expect(typeof obj.isDefault).toBe('boolean')
    })

    it('uses camelCase isDefault', () => {
      const obj = makeCalendarCategory()
      expect('isDefault' in obj).toBe(true)
      expect('is_default' in obj).toBe(false)
    })

    it('has exactly 3 keys', () => {
      expect(Object.keys(makeCalendarCategory())).toHaveLength(3)
    })
  })

  // ── CalendarCategoriesSettings ────────────────────────────────────────────

  describe('CalendarCategoriesSettings', () => {
    it('categories is an array', () => {
      const obj: CalendarCategoriesSettings = { categories: [] }
      expect(Array.isArray(obj.categories)).toBe(true)
    })

    it('accepts an array of CalendarCategory items', () => {
      const obj: CalendarCategoriesSettings = {
        categories: [makeCalendarCategory()],
      }
      expect(obj.categories).toHaveLength(1)
      expect(typeof obj.categories[0].name).toBe('string')
      expect(typeof obj.categories[0].isDefault).toBe('boolean')
    })

    it('has exactly 1 key', () => {
      expect(Object.keys({ categories: [] })).toHaveLength(1)
    })
  })

  // ── MailCategory ──────────────────────────────────────────────────────────

  describe('MailCategory', () => {
    it('has correct runtime field types', () => {
      const obj = makeMailCategory()
      expect(typeof obj.name).toBe('string')
      expect(typeof obj.color).toBe('string')
      expect(typeof obj.isDefault).toBe('boolean')
    })

    it('uses camelCase isDefault', () => {
      const obj = makeMailCategory()
      expect('isDefault' in obj).toBe(true)
      expect('is_default' in obj).toBe(false)
    })

    it('has exactly 3 keys', () => {
      expect(Object.keys(makeMailCategory())).toHaveLength(3)
    })
  })

  // ── MailCategoriesSettings ────────────────────────────────────────────────

  describe('MailCategoriesSettings', () => {
    it('categories is an array', () => {
      const obj: MailCategoriesSettings = { categories: [] }
      expect(Array.isArray(obj.categories)).toBe(true)
    })

    it('accepts an array of MailCategory items', () => {
      const obj: MailCategoriesSettings = { categories: [makeMailCategory()] }
      expect(obj.categories).toHaveLength(1)
      expect(typeof obj.categories[0].name).toBe('string')
      expect(typeof obj.categories[0].isDefault).toBe('boolean')
    })
  })

  // ── TotpSettings ──────────────────────────────────────────────────────────

  describe('TotpSettings', () => {
    it('totp is a boolean', () => {
      const obj: TotpSettings = { totp: true }
      expect(typeof obj.totp).toBe('boolean')
    })

    it('accepts true', () => {
      expect(({ totp: true } as TotpSettings).totp).toBe(true)
    })

    it('accepts false', () => {
      expect(({ totp: false } as TotpSettings).totp).toBe(false)
    })

    it('has exactly 1 key', () => {
      expect(Object.keys({ totp: true })).toHaveLength(1)
    })
  })

  // ── Structural compatibility ──────────────────────────────────────────────

  describe('structural compatibility', () => {
    it('ContactCategory, CalendarCategory, and MailCategory share the same runtime keys', () => {
      const keys = ['color', 'isDefault', 'name']
      expect(Object.keys(makeContactCategory()).sort()).toEqual(keys)
      expect(Object.keys(makeCalendarCategory()).sort()).toEqual(keys)
      expect(Object.keys(makeMailCategory()).sort()).toEqual(keys)
    })

    it('ContactCategory is assignable to CalendarCategory at runtime', () => {
      const contact = makeContactCategory()
      const asCalendar: CalendarCategory = contact
      expect(asCalendar).toEqual(contact)
    })

    it('CalendarCategory is assignable to MailCategory at runtime', () => {
      const calendar = makeCalendarCategory()
      const asMail: MailCategory = calendar
      expect(asMail).toEqual(calendar)
    })

    it('MailCategory is assignable to ContactCategory at runtime', () => {
      const mail = makeMailCategory()
      const asContact: ContactCategory = mail
      expect(asContact).toEqual(mail)
    })

    it('CalendarCategoriesSettings and MailCategoriesSettings share the same runtime shape', () => {
      const calSettings: CalendarCategoriesSettings = {
        categories: [makeCalendarCategory()],
      }
      const mailSettings: MailCategoriesSettings = calSettings
      expect(mailSettings.categories).toHaveLength(1)
    })
  })
})
