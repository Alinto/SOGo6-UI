import type {
  UserCalendarCategory,
  UserCalendarCategoryContent,
  UserCalendarGeneral,
  UserContactCategory,
  UserContactCategoryContent,
  UserContactGeneral,
  UserContactPreferences,
  UserGeneral,
  UserMailCategory,
  UserMailCategoryContent,
  UserMailGeneral,
  UserMailPreferences,
  UserPreferences,
  UserPreferencesResponse,
  UserSecurity,
} from '../user-preferences-api-types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUserGeneral(overrides = {}): UserGeneral {
  return {
    SOGO_U_LANGUAGE: 'en',
    SOGO_U_TIME_FORMAT: '24',
    SOGO_U_FIRST_MODULE: 'mail',
    SOGO_U_BROWSER_NOTIF: true,
    SOGO_U_EXT_AVATAR_ENABLED: false,
    SOGO_U_LONG_DATE: '%A, %B %e, %Y',
    SOGO_U_SHORT_DATE: '%m/%d/%Y',
    SOGO_U_TIMEZONE: 'Europe/Paris',
    ...overrides,
  }
}

function makeUserSecurity(overrides = {}): UserSecurity {
  return {
    SOGO_U_MFA_ENABLE: false,
    SOGO_U_MFA_METHOD: null,
    ...overrides,
  }
}

function makeUserContactGeneral(overrides = {}): UserContactGeneral {
  return { SOGO_U_ADDRESSBOOK_CREATION_NOTIF: false, ...overrides }
}

function makeCalendarGeneral(overrides = {}): UserCalendarGeneral {
  return {
    SOGO_U_CALENDAR_CREATION_NOTIF: false,
    SOGO_U_CALENDAR_VIEW_FIRST_DAY: 1,
    SOGO_U_WORKDAY_START_TIME: '09:00',
    SOGO_U_WORKDAY_END_TIME: '18:00',
    SOGO_U_BUSY_OFF_HOURS: false,
    SOGO_U_CALENDAR_DAYS_SHOWED: [1, 2, 3, 4, 5],
    SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: '%V',
    SOGO_U_CALENDAR_DEFAULT: 'personal',
    SOGO_U_EVENT_DEFAULT_CLASS: 'PUBLIC',
    SOGO_U_TASK_DEFAULT_CLASS: 'PUBLIC',
    SOGO_U_JOURNAL_DEFAULT_CLASS: 'PUBLIC',
    SOGO_U_EVENT_DEFAULT_REMINDER: null,
    SOGO_U_TASK_DEFAULT_REMINDER: null,
    SOGO_U_JOURNAL_DEFAULT_REMINDER: null,
    SOGO_U_NO_INVITATION: false,
    SOGO_U_NO_INVITATION_WHITELIST: [],
    SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV: false,
    SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT: false,
    ...overrides,
  }
}

function makeCategoryContent(overrides = {}): UserContactCategoryContent {
  return { name: 'Work', color: '#3b82f6', is_default: false, ...overrides }
}

function makeMailGeneral(overrides = {}): UserMailGeneral {
  return {
    SOGO_U_SHOW_ALL_UNSEEN_COUNT: false,
    SOGO_U_SORT_BY_THREAD: false,
    SOGO_U_MAIL_FORWARDING_FORMAT: 'inline',
    SOGO_U_REPLY_POSITION: 'above',
    SOGO_U_SIGNATURE_POSITION: 'below',
    SOGO_U_USE_SIGNATURE: [],
    SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: 'html',
    SOGO_U_MARK_READ_DELAY: 0,
    SOGO_U_HIDE_INLINE_ATTACHMENT: false,
    SOGO_U_COMPOSE_MAIL_WINDOW: 'popup',
    SOGO_U_ATTACHMENT_POSITION: 'above',
    SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE: false,
    SOGO_U_MAIL_ALLOW_RECEIPT: false,
    SOGO_U_COLLECT_UNKNWON_ADDRESSES: false,
    SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME: '',
    ...overrides,
  }
}

function makeUserPreferences(overrides = {}): UserPreferences {
  return {
    USER_GENERAL: makeUserGeneral(),
    USER_SECURITY: makeUserSecurity(),
    USER_CALENDAR_GENERAL: makeCalendarGeneral(),
    USER_CALENDAR_CATEGORY: { SOGO_U_CALENDAR_CATEGORIES: [] },
    USER_CONTACT_GENERAL: makeUserContactGeneral(),
    USER_CONTACT_CATEGORY: { SOGO_U_CONTACT_CATEGORIES: [] },
    USER_MAIL_GENERAL_SETTINGS: makeMailGeneral(),
    USER_MAIL_CATEGORY_SETTINGS: { SOGO_U_MAIL_CATEGORIES: [] },
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('user-preferences-api-types runtime shape validation', () => {
  // ── UserGeneral ─────────────────────────────────────────────────────────

  describe('UserGeneral', () => {
    it('constructs a valid object with all required fields', () => {
      const obj = makeUserGeneral()
      expect(typeof obj.SOGO_U_LANGUAGE).toBe('string')
      expect(typeof obj.SOGO_U_TIME_FORMAT).toBe('string')
      expect(typeof obj.SOGO_U_FIRST_MODULE).toBe('string')
      expect(typeof obj.SOGO_U_BROWSER_NOTIF).toBe('boolean')
      expect(typeof obj.SOGO_U_EXT_AVATAR_ENABLED).toBe('boolean')
      expect(typeof obj.SOGO_U_LONG_DATE).toBe('string')
      expect(typeof obj.SOGO_U_SHORT_DATE).toBe('string')
      expect(typeof obj.SOGO_U_TIMEZONE).toBe('string')
    })

    it('has exactly 8 keys', () => {
      expect(Object.keys(makeUserGeneral())).toHaveLength(8)
    })

    it('accepts true and false for boolean fields', () => {
      expect(
        makeUserGeneral({ SOGO_U_BROWSER_NOTIF: true }).SOGO_U_BROWSER_NOTIF
      ).toBe(true)
      expect(
        makeUserGeneral({ SOGO_U_EXT_AVATAR_ENABLED: false })
          .SOGO_U_EXT_AVATAR_ENABLED
      ).toBe(false)
    })
  })

  // ── UserSecurity ─────────────────────────────────────────────────────────

  describe('UserSecurity', () => {
    it('accepts MFA_METHOD as "totp"', () => {
      const obj = makeUserSecurity({ SOGO_U_MFA_METHOD: 'totp' })
      expect(obj.SOGO_U_MFA_METHOD).toBe('totp')
    })

    it('accepts MFA_METHOD as null', () => {
      const obj = makeUserSecurity({ SOGO_U_MFA_METHOD: null })
      expect(obj.SOGO_U_MFA_METHOD).toBeNull()
    })

    it('accepts optional MFA_PARAM when provided', () => {
      const obj: UserSecurity = {
        ...makeUserSecurity(),
        SOGO_U_MFA_PARAM: { secret: 'abc123' },
      }
      expect(obj.SOGO_U_MFA_PARAM).toEqual({ secret: 'abc123' })
    })

    it('MFA_PARAM is absent when not provided', () => {
      const obj = makeUserSecurity()
      expect(obj.SOGO_U_MFA_PARAM).toBeUndefined()
    })

    it('MFA_ENABLE is a boolean', () => {
      expect(typeof makeUserSecurity().SOGO_U_MFA_ENABLE).toBe('boolean')
    })
  })

  // ── UserContactGeneral ───────────────────────────────────────────────────

  describe('UserContactGeneral', () => {
    it('SOGO_U_ADDRESSBOOK_CREATION_NOTIF is a boolean', () => {
      expect(
        typeof makeUserContactGeneral().SOGO_U_ADDRESSBOOK_CREATION_NOTIF
      ).toBe('boolean')
    })

    it('accepts both true and false', () => {
      expect(
        makeUserContactGeneral({ SOGO_U_ADDRESSBOOK_CREATION_NOTIF: true })
          .SOGO_U_ADDRESSBOOK_CREATION_NOTIF
      ).toBe(true)
      expect(
        makeUserContactGeneral({ SOGO_U_ADDRESSBOOK_CREATION_NOTIF: false })
          .SOGO_U_ADDRESSBOOK_CREATION_NOTIF
      ).toBe(false)
    })
  })

  // ── UserCalendarGeneral ──────────────────────────────────────────────────

  describe('UserCalendarGeneral', () => {
    it('constructs with all required fields having correct runtime types', () => {
      const obj = makeCalendarGeneral()
      expect(typeof obj.SOGO_U_CALENDAR_CREATION_NOTIF).toBe('boolean')
      expect(typeof obj.SOGO_U_CALENDAR_VIEW_FIRST_DAY).toBe('number')
      expect(typeof obj.SOGO_U_WORKDAY_START_TIME).toBe('string')
      expect(typeof obj.SOGO_U_WORKDAY_END_TIME).toBe('string')
      expect(typeof obj.SOGO_U_BUSY_OFF_HOURS).toBe('boolean')
      expect(Array.isArray(obj.SOGO_U_CALENDAR_DAYS_SHOWED)).toBe(true)
      expect(typeof obj.SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT).toBe('string')
      expect(typeof obj.SOGO_U_CALENDAR_DEFAULT).toBe('string')
      expect(typeof obj.SOGO_U_EVENT_DEFAULT_CLASS).toBe('string')
      expect(typeof obj.SOGO_U_NO_INVITATION).toBe('boolean')
      expect(Array.isArray(obj.SOGO_U_NO_INVITATION_WHITELIST)).toBe(true)
      expect(typeof obj.SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV).toBe('boolean')
      expect(typeof obj.SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT).toBe('boolean')
    })

    it('accepts valid calendarWeekNumberFormat values', () => {
      const validFormats: Array<'%U' | '%W' | '%V'> = ['%U', '%W', '%V']
      for (const fmt of validFormats) {
        const obj = makeCalendarGeneral({
          SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: fmt,
        })
        expect(obj.SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT).toBe(fmt)
      }
    })

    it('accepts valid class values for event, task, and journal', () => {
      const validClasses: Array<'PUBLIC' | 'CONFIDENTIAL' | 'PRIVATE'> = [
        'PUBLIC',
        'CONFIDENTIAL',
        'PRIVATE',
      ]
      for (const cls of validClasses) {
        const obj = makeCalendarGeneral({
          SOGO_U_EVENT_DEFAULT_CLASS: cls,
          SOGO_U_TASK_DEFAULT_CLASS: cls,
          SOGO_U_JOURNAL_DEFAULT_CLASS: cls,
        })
        expect(obj.SOGO_U_EVENT_DEFAULT_CLASS).toBe(cls)
        expect(obj.SOGO_U_TASK_DEFAULT_CLASS).toBe(cls)
        expect(obj.SOGO_U_JOURNAL_DEFAULT_CLASS).toBe(cls)
      }
    })

    it('accepts null for reminder fields', () => {
      const obj = makeCalendarGeneral({
        SOGO_U_EVENT_DEFAULT_REMINDER: null,
        SOGO_U_TASK_DEFAULT_REMINDER: null,
        SOGO_U_JOURNAL_DEFAULT_REMINDER: null,
      })
      expect(obj.SOGO_U_EVENT_DEFAULT_REMINDER).toBeNull()
      expect(obj.SOGO_U_TASK_DEFAULT_REMINDER).toBeNull()
      expect(obj.SOGO_U_JOURNAL_DEFAULT_REMINDER).toBeNull()
    })

    it('accepts string values for reminder fields', () => {
      const obj = makeCalendarGeneral({
        SOGO_U_EVENT_DEFAULT_REMINDER: '15',
        SOGO_U_TASK_DEFAULT_REMINDER: '30',
        SOGO_U_JOURNAL_DEFAULT_REMINDER: '60',
      })
      expect(obj.SOGO_U_EVENT_DEFAULT_REMINDER).toBe('15')
      expect(obj.SOGO_U_TASK_DEFAULT_REMINDER).toBe('30')
      expect(obj.SOGO_U_JOURNAL_DEFAULT_REMINDER).toBe('60')
    })

    it('accepts a non-empty whitelist array', () => {
      const obj = makeCalendarGeneral({
        SOGO_U_NO_INVITATION_WHITELIST: ['a@b.com', 'c@d.com'],
      })
      expect(obj.SOGO_U_NO_INVITATION_WHITELIST).toEqual(['a@b.com', 'c@d.com'])
    })
  })

  // ── UserContactCategoryContent ───────────────────────────────────────────

  describe('UserContactCategoryContent', () => {
    it('has correct field types', () => {
      const obj = makeCategoryContent()
      expect(typeof obj.name).toBe('string')
      expect(typeof obj.color).toBe('string')
      expect(typeof obj.is_default).toBe('boolean')
    })

    it('uses snake_case is_default (not isDefault)', () => {
      const obj = makeCategoryContent()
      expect('is_default' in obj).toBe(true)
      expect('isDefault' in obj).toBe(false)
    })
  })

  // ── UserContactCategory ──────────────────────────────────────────────────

  describe('UserContactCategory', () => {
    it('SOGO_U_CONTACT_CATEGORIES is an array', () => {
      const obj: UserContactCategory = { SOGO_U_CONTACT_CATEGORIES: [] }
      expect(Array.isArray(obj.SOGO_U_CONTACT_CATEGORIES)).toBe(true)
    })

    it('accepts an array of category content objects', () => {
      const obj: UserContactCategory = {
        SOGO_U_CONTACT_CATEGORIES: [makeCategoryContent()],
      }
      expect(obj.SOGO_U_CONTACT_CATEGORIES).toHaveLength(1)
    })
  })

  // ── UserCalendarCategoryContent ──────────────────────────────────────────

  describe('UserCalendarCategoryContent', () => {
    it('has the same shape as UserContactCategoryContent', () => {
      const obj: UserCalendarCategoryContent = makeCategoryContent()
      expect(typeof obj.name).toBe('string')
      expect(typeof obj.color).toBe('string')
      expect(typeof obj.is_default).toBe('boolean')
    })
  })

  // ── UserCalendarCategory ─────────────────────────────────────────────────

  describe('UserCalendarCategory', () => {
    it('SOGO_U_CALENDAR_CATEGORIES is an array', () => {
      const obj: UserCalendarCategory = { SOGO_U_CALENDAR_CATEGORIES: [] }
      expect(Array.isArray(obj.SOGO_U_CALENDAR_CATEGORIES)).toBe(true)
    })
  })

  // ── UserContactPreferences ───────────────────────────────────────────────

  describe('UserContactPreferences', () => {
    it('contains USER_CONTACT_GENERAL and USER_CONTACT_CATEGORY', () => {
      const obj: UserContactPreferences = {
        USER_CONTACT_GENERAL: makeUserContactGeneral(),
        USER_CONTACT_CATEGORY: { SOGO_U_CONTACT_CATEGORIES: [] },
      }
      expect(obj.USER_CONTACT_GENERAL).toBeDefined()
      expect(obj.USER_CONTACT_CATEGORY).toBeDefined()
    })
  })

  // ── UserMailGeneral ──────────────────────────────────────────────────────

  describe('UserMailGeneral', () => {
    it('constructs with all required fields having correct runtime types', () => {
      const obj = makeMailGeneral()
      expect(typeof obj.SOGO_U_SHOW_ALL_UNSEEN_COUNT).toBe('boolean')
      expect(typeof obj.SOGO_U_SORT_BY_THREAD).toBe('boolean')
      expect(typeof obj.SOGO_U_MAIL_FORWARDING_FORMAT).toBe('string')
      expect(typeof obj.SOGO_U_REPLY_POSITION).toBe('string')
      expect(typeof obj.SOGO_U_SIGNATURE_POSITION).toBe('string')
      expect(Array.isArray(obj.SOGO_U_USE_SIGNATURE)).toBe(true)
      expect(typeof obj.SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT).toBe('string')
      expect(typeof obj.SOGO_U_MARK_READ_DELAY).toBe('number')
      expect(typeof obj.SOGO_U_HIDE_INLINE_ATTACHMENT).toBe('boolean')
      expect(typeof obj.SOGO_U_COMPOSE_MAIL_WINDOW).toBe('string')
      expect(typeof obj.SOGO_U_ATTACHMENT_POSITION).toBe('string')
      expect(typeof obj.SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE).toBe('boolean')
      expect(typeof obj.SOGO_U_MAIL_ALLOW_RECEIPT).toBe('boolean')
      expect(typeof obj.SOGO_U_COLLECT_UNKNWON_ADDRESSES).toBe('boolean')
      expect(typeof obj.SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME).toBe('string')
    })

    it('accepts valid SOGO_U_MAIL_FORWARDING_FORMAT values', () => {
      expect(
        makeMailGeneral({ SOGO_U_MAIL_FORWARDING_FORMAT: 'inline' })
          .SOGO_U_MAIL_FORWARDING_FORMAT
      ).toBe('inline')
      expect(
        makeMailGeneral({ SOGO_U_MAIL_FORWARDING_FORMAT: 'attachment' })
          .SOGO_U_MAIL_FORWARDING_FORMAT
      ).toBe('attachment')
    })

    it('accepts valid SOGO_U_REPLY_POSITION and SOGO_U_SIGNATURE_POSITION values', () => {
      expect(
        makeMailGeneral({ SOGO_U_REPLY_POSITION: 'above' })
          .SOGO_U_REPLY_POSITION
      ).toBe('above')
      expect(
        makeMailGeneral({ SOGO_U_REPLY_POSITION: 'below' })
          .SOGO_U_REPLY_POSITION
      ).toBe('below')
      expect(
        makeMailGeneral({ SOGO_U_SIGNATURE_POSITION: 'above' })
          .SOGO_U_SIGNATURE_POSITION
      ).toBe('above')
      expect(
        makeMailGeneral({ SOGO_U_SIGNATURE_POSITION: 'below' })
          .SOGO_U_SIGNATURE_POSITION
      ).toBe('below')
    })

    it('accepts valid SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT values', () => {
      expect(
        makeMailGeneral({ SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: 'html' })
          .SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT
      ).toBe('html')
      expect(
        makeMailGeneral({ SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT: 'text' })
          .SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT
      ).toBe('text')
    })

    it('accepts valid SOGO_U_COMPOSE_MAIL_WINDOW values', () => {
      expect(
        makeMailGeneral({ SOGO_U_COMPOSE_MAIL_WINDOW: 'inline' })
          .SOGO_U_COMPOSE_MAIL_WINDOW
      ).toBe('inline')
      expect(
        makeMailGeneral({ SOGO_U_COMPOSE_MAIL_WINDOW: 'popup' })
          .SOGO_U_COMPOSE_MAIL_WINDOW
      ).toBe('popup')
    })

    it('accepts valid SOGO_U_ATTACHMENT_POSITION values', () => {
      expect(
        makeMailGeneral({ SOGO_U_ATTACHMENT_POSITION: 'above' })
          .SOGO_U_ATTACHMENT_POSITION
      ).toBe('above')
      expect(
        makeMailGeneral({ SOGO_U_ATTACHMENT_POSITION: 'below' })
          .SOGO_U_ATTACHMENT_POSITION
      ).toBe('below')
    })

    it('accepts all valid SOGO_U_USE_SIGNATURE combinations', () => {
      const allSigs: Array<'new' | 'reply' | 'forward'> = [
        'new',
        'reply',
        'forward',
      ]
      const obj = makeMailGeneral({ SOGO_U_USE_SIGNATURE: allSigs })
      expect(obj.SOGO_U_USE_SIGNATURE).toEqual(['new', 'reply', 'forward'])
    })

    it('accepts empty SOGO_U_USE_SIGNATURE array', () => {
      const obj = makeMailGeneral({ SOGO_U_USE_SIGNATURE: [] })
      expect(obj.SOGO_U_USE_SIGNATURE).toEqual([])
    })
  })

  // ── UserMailCategoryContent ──────────────────────────────────────────────

  describe('UserMailCategoryContent', () => {
    it('has correct field types', () => {
      const obj: UserMailCategoryContent = {
        name: 'Inbox',
        color: '#10b981',
        is_default: true,
      }
      expect(typeof obj.name).toBe('string')
      expect(typeof obj.color).toBe('string')
      expect(typeof obj.is_default).toBe('boolean')
    })

    it('uses snake_case is_default', () => {
      const obj: UserMailCategoryContent = {
        name: 'X',
        color: '#000',
        is_default: false,
      }
      expect('is_default' in obj).toBe(true)
      expect('isDefault' in obj).toBe(false)
    })
  })

  // ── UserMailCategory ─────────────────────────────────────────────────────

  describe('UserMailCategory', () => {
    it('SOGO_U_MAIL_CATEGORIES is an array', () => {
      const obj: UserMailCategory = { SOGO_U_MAIL_CATEGORIES: [] }
      expect(Array.isArray(obj.SOGO_U_MAIL_CATEGORIES)).toBe(true)
    })
  })

  // ── UserMailPreferences ──────────────────────────────────────────────────

  describe('UserMailPreferences', () => {
    it('contains USER_MAIL_GENERAL and USER_MAIL_CATEGORY', () => {
      const obj: UserMailPreferences = {
        USER_MAIL_GENERAL: makeMailGeneral(),
        USER_MAIL_CATEGORY: { SOGO_U_MAIL_CATEGORIES: [] },
      }
      expect(obj.USER_MAIL_GENERAL).toBeDefined()
      expect(obj.USER_MAIL_CATEGORY).toBeDefined()
    })
  })

  // ── UserPreferences ──────────────────────────────────────────────────────

  describe('UserPreferences', () => {
    it('contains all 8 required top-level keys', () => {
      const obj = makeUserPreferences()
      expect(obj).toHaveProperty('USER_GENERAL')
      expect(obj).toHaveProperty('USER_SECURITY')
      expect(obj).toHaveProperty('USER_CALENDAR_GENERAL')
      expect(obj).toHaveProperty('USER_CALENDAR_CATEGORY')
      expect(obj).toHaveProperty('USER_CONTACT_GENERAL')
      expect(obj).toHaveProperty('USER_CONTACT_CATEGORY')
      expect(obj).toHaveProperty('USER_MAIL_GENERAL_SETTINGS')
      expect(obj).toHaveProperty('USER_MAIL_CATEGORY_SETTINGS')
    })

    it('USER_GENERAL is a UserGeneral shape', () => {
      const obj = makeUserPreferences()
      expect(typeof obj.USER_GENERAL.SOGO_U_LANGUAGE).toBe('string')
      expect(typeof obj.USER_GENERAL.SOGO_U_BROWSER_NOTIF).toBe('boolean')
    })

    it('USER_SECURITY contains MFA fields', () => {
      const obj = makeUserPreferences()
      expect(typeof obj.USER_SECURITY.SOGO_U_MFA_ENABLE).toBe('boolean')
      expect([null, 'totp']).toContain(obj.USER_SECURITY.SOGO_U_MFA_METHOD)
    })

    it('USER_MAIL_GENERAL_SETTINGS and USER_MAIL_CATEGORY_SETTINGS use mail-specific keys', () => {
      const obj = makeUserPreferences()
      expect(obj.USER_MAIL_GENERAL_SETTINGS).toHaveProperty(
        'SOGO_U_SORT_BY_THREAD'
      )
      expect(obj.USER_MAIL_CATEGORY_SETTINGS).toHaveProperty(
        'SOGO_U_MAIL_CATEGORIES'
      )
    })
  })

  // ── UserPreferencesResponse ──────────────────────────────────────────────

  describe('UserPreferencesResponse', () => {
    it('contains data, error_code, and error_msg', () => {
      const obj: UserPreferencesResponse = {
        data: makeUserPreferences(),
        error_code: '0',
        error_msg: '',
      }
      expect(obj.data).toBeDefined()
      expect(typeof obj.error_code).toBe('string')
      expect(typeof obj.error_msg).toBe('string')
    })

    it('data field contains a full UserPreferences object', () => {
      const prefs = makeUserPreferences()
      const response: UserPreferencesResponse = {
        data: prefs,
        error_code: '0',
        error_msg: '',
      }
      expect(response.data).toBe(prefs)
    })
  })

  // ── Structural compatibility ─────────────────────────────────────────────

  describe('structural compatibility between category content types', () => {
    it('UserContactCategoryContent is assignable to UserCalendarCategoryContent', () => {
      const contact = makeCategoryContent()
      const asCalendar: UserCalendarCategoryContent = contact
      expect(asCalendar).toEqual(contact)
    })

    it('UserCalendarCategoryContent is assignable to UserMailCategoryContent', () => {
      const calendar: UserCalendarCategoryContent = makeCategoryContent()
      const asMail: UserMailCategoryContent = calendar
      expect(asMail).toEqual(calendar)
    })

    it('all three content types share the same runtime keys', () => {
      const obj = makeCategoryContent()
      expect(Object.keys(obj).sort()).toEqual(['color', 'is_default', 'name'])
    })
  })
})
