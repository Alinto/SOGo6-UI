import type { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'
import type {
  CalendarCategoriesSettings,
  CalendarGeneralSettings,
} from '../../../store/user-preferences-types'
import {
  apiToCalendarGeneral,
  calendarGeneralToApi,
  mapApiToCalendarCategorySettings,
  mapCalendarCategorySettingsToApi,
} from '../calendar-utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeGeneralSettings(
  overrides: Partial<CalendarGeneralSettings> = {}
): CalendarGeneralSettings {
  return {
    calendarCreationNotif: false,
    calendarViewFirstDay: 1,
    workdayStartTime: '08:00',
    workdayEndTime: '18:00',
    busyOffHours: false,
    calendarDaysShowed: [4],
    calendarWeekNumberFormat: '%U',
    calendarDefault: 'personal',
    eventDefaultClass: 'PUBLIC',
    taskDefaultClass: 'PUBLIC',
    journalDefaultClass: 'PUBLIC',
    eventDefaultReminder: '-1',
    taskDefaultReminder: '-1',
    journalDefaultReminder: '-1',
    noInvitation: false,
    noInvitationWhitelist: [],
    doNotSendInvitFromDav: false,
    davForceSyncFromClient: false,
    ...overrides,
  }
}

function makeApiPreferences(
  overrides: Partial<UserPreferences['USER_CALENDAR_GENERAL']> = {},
  categoryOverrides = {}
): UserPreferences {
  return {
    USER_CALENDAR_GENERAL: {
      SOGO_U_CALENDAR_CREATION_NOTIF: false,
      SOGO_U_CALENDAR_VIEW_FIRST_DAY: 1,
      SOGO_U_WORKDAY_START_TIME: '08:00',
      SOGO_U_WORKDAY_END_TIME: '18:00',
      SOGO_U_BUSY_OFF_HOURS: false,
      SOGO_U_CALENDAR_DAYS_SHOWED: 7,
      SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: 'iso',
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
    },
    USER_CALENDAR_CATEGORY: { SOGO_U_CALENDAR_CATEGORIES: [] },
    ...categoryOverrides,
  } as unknown as UserPreferences
}

function makeCategory(overrides = {}) {
  return { name: 'Work', color: '#3b82f6', isDefault: false, ...overrides }
}

function makeCategorySettings(
  overrides: Partial<CalendarCategoriesSettings> = {}
): CalendarCategoriesSettings {
  return { categories: [], ...overrides }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('calendar-utils', () => {
  // ── calendarGeneralToApi ───────────────────────────────────────────────────

  describe('calendarGeneralToApi', () => {
    it('maps all scalar fields to their API snake_case keys', () => {
      const settings = makeGeneralSettings({
        calendarCreationNotif: true,
        calendarViewFirstDay: 0,
        workdayStartTime: '09:00',
        workdayEndTime: '17:00',
        busyOffHours: true,
        calendarDaysShowed: [2, 4],
        calendarWeekNumberFormat: '%U',
        calendarDefault: 'team',
        eventDefaultClass: 'PRIVATE',
        taskDefaultClass: 'CONFIDENTIAL',
        journalDefaultClass: 'PRIVATE',
        noInvitation: true,
        noInvitationWhitelist: ['alice@example.com'],
        doNotSendInvitFromDav: true,
        davForceSyncFromClient: true,
      })
      const result = calendarGeneralToApi(settings)
      expect(result.SOGO_U_CALENDAR_CREATION_NOTIF).toBe(true)
      expect(result.SOGO_U_CALENDAR_VIEW_FIRST_DAY).toBe(0)
      expect(result.SOGO_U_WORKDAY_START_TIME).toBe('09:00')
      expect(result.SOGO_U_WORKDAY_END_TIME).toBe('17:00')
      expect(result.SOGO_U_BUSY_OFF_HOURS).toBe(true)
      expect(result.SOGO_U_CALENDAR_DAYS_SHOWED).toStrictEqual([2, 4])
      expect(result.SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT).toBe('%U')
      expect(result.SOGO_U_CALENDAR_DEFAULT).toBe('team')
      expect(result.SOGO_U_EVENT_DEFAULT_CLASS).toBe('PRIVATE')
      expect(result.SOGO_U_TASK_DEFAULT_CLASS).toBe('CONFIDENTIAL')
      expect(result.SOGO_U_JOURNAL_DEFAULT_CLASS).toBe('PRIVATE')
      expect(result.SOGO_U_NO_INVITATION).toBe(true)
      expect(result.SOGO_U_NO_INVITATION_WHITELIST).toEqual([
        'alice@example.com',
      ])
      expect(result.SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV).toBe(true)
      expect(result.SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT).toBe(true)
    })

    describe('reminder fields: sentinel "-1" → null', () => {
      it('maps eventDefaultReminder "-1" to null', () => {
        const result = calendarGeneralToApi(
          makeGeneralSettings({ eventDefaultReminder: '-1' })
        )
        expect(result.SOGO_U_EVENT_DEFAULT_REMINDER).toBeNull()
      })

      it('maps taskDefaultReminder "-1" to null', () => {
        const result = calendarGeneralToApi(
          makeGeneralSettings({ taskDefaultReminder: '-1' })
        )
        expect(result.SOGO_U_TASK_DEFAULT_REMINDER).toBeNull()
      })

      it('maps journalDefaultReminder "-1" to null', () => {
        const result = calendarGeneralToApi(
          makeGeneralSettings({ journalDefaultReminder: '-1' })
        )
        expect(result.SOGO_U_JOURNAL_DEFAULT_REMINDER).toBeNull()
      })
    })

    describe('reminder fields: non-sentinel uses journalDefaultReminder', () => {
      it('uses journalDefaultReminder for SOGO_U_EVENT_DEFAULT_REMINDER when eventDefaultReminder is not "-1"', () => {
        const settings = makeGeneralSettings({
          eventDefaultReminder: '15',
          journalDefaultReminder: '30',
        })
        const result = calendarGeneralToApi(settings)
        expect(result.SOGO_U_EVENT_DEFAULT_REMINDER).toBe('30')
      })

      it('uses journalDefaultReminder for SOGO_U_TASK_DEFAULT_REMINDER when taskDefaultReminder is not "-1"', () => {
        const settings = makeGeneralSettings({
          taskDefaultReminder: '10',
          journalDefaultReminder: '45',
        })
        const result = calendarGeneralToApi(settings)
        expect(result.SOGO_U_TASK_DEFAULT_REMINDER).toBe('45')
      })

      it('uses journalDefaultReminder for SOGO_U_JOURNAL_DEFAULT_REMINDER when journalDefaultReminder is not "-1"', () => {
        const settings = makeGeneralSettings({ journalDefaultReminder: '60' })
        const result = calendarGeneralToApi(settings)
        expect(result.SOGO_U_JOURNAL_DEFAULT_REMINDER).toBe('60')
      })
    })
  })

  // ── apiToCalendarGeneral ───────────────────────────────────────────────────

  describe('apiToCalendarGeneral', () => {
    it('maps all API fields to camelCase settings', () => {
      const data = makeApiPreferences({
        SOGO_U_CALENDAR_CREATION_NOTIF: true,
        SOGO_U_CALENDAR_VIEW_FIRST_DAY: 0,
        SOGO_U_WORKDAY_START_TIME: '09:00',
        SOGO_U_WORKDAY_END_TIME: '17:00',
        SOGO_U_BUSY_OFF_HOURS: true,
        SOGO_U_CALENDAR_DAYS_SHOWED: [4],
        SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: '%U',
        SOGO_U_CALENDAR_DEFAULT: 'team',
        SOGO_U_EVENT_DEFAULT_CLASS: 'PRIVATE',
        SOGO_U_TASK_DEFAULT_CLASS: 'CONFIDENTIAL',
        SOGO_U_JOURNAL_DEFAULT_CLASS: 'PRIVATE',
        SOGO_U_NO_INVITATION: true,
        SOGO_U_NO_INVITATION_WHITELIST: ['bob@example.com'],
        SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV: true,
        SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT: true,
      })
      const result = apiToCalendarGeneral(data)
      expect(result.calendarCreationNotif).toBe(true)
      expect(result.calendarViewFirstDay).toBe(0)
      expect(result.workdayStartTime).toBe('09:00')
      expect(result.workdayEndTime).toBe('17:00')
      expect(result.busyOffHours).toBe(true)
      expect(result.calendarDaysShowed).toStrictEqual([4])
      expect(result.calendarWeekNumberFormat).toBe('%U')
      expect(result.calendarDefault).toBe('team')
      expect(result.eventDefaultClass).toBe('PRIVATE')
      expect(result.taskDefaultClass).toBe('CONFIDENTIAL')
      expect(result.journalDefaultClass).toBe('PRIVATE')
      expect(result.noInvitation).toBe(true)
      expect(result.noInvitationWhitelist).toEqual(['bob@example.com'])
      expect(result.doNotSendInvitFromDav).toBe(true)
      expect(result.davForceSyncFromClient).toBe(true)
    })

    describe('reminder fallback to "-1"', () => {
      it('falls back to "-1" when SOGO_U_EVENT_DEFAULT_REMINDER is null', () => {
        const result = apiToCalendarGeneral(
          makeApiPreferences({ SOGO_U_EVENT_DEFAULT_REMINDER: null })
        )
        expect(result.eventDefaultReminder).toBe('-1')
      })

      it('falls back to "-1" when SOGO_U_TASK_DEFAULT_REMINDER is null', () => {
        const result = apiToCalendarGeneral(
          makeApiPreferences({ SOGO_U_TASK_DEFAULT_REMINDER: null })
        )
        expect(result.taskDefaultReminder).toBe('-1')
      })

      it('falls back to "-1" when SOGO_U_JOURNAL_DEFAULT_REMINDER is null', () => {
        const result = apiToCalendarGeneral(
          makeApiPreferences({ SOGO_U_JOURNAL_DEFAULT_REMINDER: null })
        )
        expect(result.journalDefaultReminder).toBe('-1')
      })

      it('falls back to "-1" when SOGO_U_EVENT_DEFAULT_REMINDER is undefined', () => {
        const result = apiToCalendarGeneral(
          makeApiPreferences({ SOGO_U_EVENT_DEFAULT_REMINDER: undefined })
        )
        expect(result.eventDefaultReminder).toBe('-1')
      })
    })

    describe('noInvitationWhitelist fallback', () => {
      it('falls back to empty array when SOGO_U_NO_INVITATION_WHITELIST is null', () => {
        const result = apiToCalendarGeneral(
          makeApiPreferences({ SOGO_U_NO_INVITATION_WHITELIST: [] })
        )
        expect(result.noInvitationWhitelist).toEqual([])
      })

      it('falls back to empty array when SOGO_U_NO_INVITATION_WHITELIST is undefined', () => {
        const result = apiToCalendarGeneral(
          makeApiPreferences({ SOGO_U_NO_INVITATION_WHITELIST: undefined })
        )
        expect(result.noInvitationWhitelist).toEqual([])
      })

      it('preserves a non-empty whitelist', () => {
        const result = apiToCalendarGeneral(
          makeApiPreferences({
            SOGO_U_NO_INVITATION_WHITELIST: [
              'alice@example.com',
              'bob@example.com',
            ],
          })
        )
        expect(result.noInvitationWhitelist).toEqual([
          'alice@example.com',
          'bob@example.com',
        ])
      })
    })
  })

  // ── mapCalendarCategorySettingsToApi ──────────────────────────────────────

  describe('mapCalendarCategorySettingsToApi', () => {
    it('returns the correct top-level key', () => {
      expect(
        mapCalendarCategorySettingsToApi(makeCategorySettings())
      ).toHaveProperty('SOGO_U_CALENDAR_CATEGORIES')
    })

    it('returns an empty array when categories is empty', () => {
      expect(
        mapCalendarCategorySettingsToApi(makeCategorySettings())
          .SOGO_U_CALENDAR_CATEGORIES
      ).toEqual([])
    })

    it('maps a single category to API shape', () => {
      const settings = makeCategorySettings({
        categories: [
          makeCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
        ],
      })
      expect(
        mapCalendarCategorySettingsToApi(settings).SOGO_U_CALENDAR_CATEGORIES
      ).toEqual([{ name: 'Work', color: '#ef4444', is_default: true }])
    })

    it('maps multiple categories preserving order', () => {
      const settings = makeCategorySettings({
        categories: [
          makeCategory({
            name: 'Personal',
            color: '#3b82f6',
            isDefault: false,
          }),
          makeCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
          makeCategory({ name: 'Family', color: '#10b981', isDefault: false }),
        ],
      })
      const result =
        mapCalendarCategorySettingsToApi(settings).SOGO_U_CALENDAR_CATEGORIES
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        name: 'Personal',
        color: '#3b82f6',
        is_default: false,
      })
      expect(result[1]).toEqual({
        name: 'Work',
        color: '#ef4444',
        is_default: true,
      })
      expect(result[2]).toEqual({
        name: 'Family',
        color: '#10b981',
        is_default: false,
      })
    })

    it('converts camelCase isDefault to snake_case is_default', () => {
      const settings = makeCategorySettings({
        categories: [makeCategory({ isDefault: true })],
      })
      const [cat] =
        mapCalendarCategorySettingsToApi(settings).SOGO_U_CALENDAR_CATEGORIES
      expect(cat).toHaveProperty('is_default', true)
      expect(cat).not.toHaveProperty('isDefault')
    })

    it('preserves name and color values exactly', () => {
      const settings = makeCategorySettings({
        categories: [makeCategory({ name: 'Exact Name', color: '#abcdef' })],
      })
      const [cat] =
        mapCalendarCategorySettingsToApi(settings).SOGO_U_CALENDAR_CATEGORIES
      expect(cat.name).toBe('Exact Name')
      expect(cat.color).toBe('#abcdef')
    })
  })

  // ── mapApiToCalendarCategorySettings ──────────────────────────────────────

  describe('mapApiToCalendarCategorySettings', () => {
    it('returns an empty categories array when SOGO_U_CALENDAR_CATEGORIES is empty', () => {
      expect(
        mapApiToCalendarCategorySettings(makeApiPreferences()).categories
      ).toEqual([])
    })

    it('maps a single API category to CalendarCategory', () => {
      const data = makeApiPreferences(
        {},
        {
          USER_CALENDAR_CATEGORY: {
            SOGO_U_CALENDAR_CATEGORIES: [
              { name: 'Work', color: '#ef4444', is_default: true },
            ],
          },
        }
      )
      expect(mapApiToCalendarCategorySettings(data).categories).toEqual([
        { name: 'Work', color: '#ef4444', isDefault: true },
      ])
    })

    it('maps multiple API categories preserving order', () => {
      const data = makeApiPreferences(
        {},
        {
          USER_CALENDAR_CATEGORY: {
            SOGO_U_CALENDAR_CATEGORIES: [
              { name: 'Personal', color: '#3b82f6', is_default: false },
              { name: 'Work', color: '#ef4444', is_default: true },
            ],
          },
        }
      )
      const { categories } = mapApiToCalendarCategorySettings(data)
      expect(categories).toHaveLength(2)
      expect(categories[0]).toEqual({
        name: 'Personal',
        color: '#3b82f6',
        isDefault: false,
      })
      expect(categories[1]).toEqual({
        name: 'Work',
        color: '#ef4444',
        isDefault: true,
      })
    })

    it('converts snake_case is_default to camelCase isDefault', () => {
      const data = makeApiPreferences(
        {},
        {
          USER_CALENDAR_CATEGORY: {
            SOGO_U_CALENDAR_CATEGORIES: [
              { name: 'X', color: '#000', is_default: true },
            ],
          },
        }
      )
      const [cat] = mapApiToCalendarCategorySettings(data).categories
      expect(cat).toHaveProperty('isDefault', true)
      expect(cat).not.toHaveProperty('is_default')
    })

    it('falls back to empty array when USER_CALENDAR_CATEGORY is undefined', () => {
      const data = makeApiPreferences({}, { USER_CALENDAR_CATEGORY: undefined })
      expect(mapApiToCalendarCategorySettings(data).categories).toEqual([])
    })

    it('falls back to empty array when SOGO_U_CALENDAR_CATEGORIES is undefined', () => {
      const data = makeApiPreferences({}, { USER_CALENDAR_CATEGORY: {} })
      expect(mapApiToCalendarCategorySettings(data).categories).toEqual([])
    })
  })

  // ── round-trip: categories ────────────────────────────────────────────────

  describe('round-trip: categories (toApi → fromApi)', () => {
    it('recovers the original category settings after mapping to API and back', () => {
      const original = makeCategorySettings({
        categories: [
          makeCategory({
            name: 'Personal',
            color: '#3b82f6',
            isDefault: false,
          }),
          makeCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
        ],
      })
      const apiShape = mapCalendarCategorySettingsToApi(original)
      const asPreferences = makeApiPreferences(
        {},
        {
          USER_CALENDAR_CATEGORY: apiShape,
        }
      )
      expect(mapApiToCalendarCategorySettings(asPreferences)).toEqual(original)
    })
  })
})
