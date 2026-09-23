import '@testing-library/jest-dom'

import * as CalendarsApi from '../calendars-api'

describe('calendars-api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('injected RTK Query hooks', () => {
    it('exports getCalendars-related queries', () => {
      expect(typeof CalendarsApi.useGetCalendarsQuery).toBe('function')
      expect(typeof CalendarsApi.useGetCalendarByIdQuery).toBe('function')
    })

    it('exports calendar event queries and mutations', () => {
      expect(typeof CalendarsApi.useGetEventsQuery).toBe('function')
      expect(typeof CalendarsApi.useGetEventsInTimeRangeQuery).toBe('function')
      expect(typeof CalendarsApi.useGetCalendarEventByIdQuery).toBe('function')
      expect(typeof CalendarsApi.useCreateCalendarEventMutation).toBe(
        'function'
      )
      expect(typeof CalendarsApi.useUpdateCalendarEventMutation).toBe(
        'function'
      )
      expect(typeof CalendarsApi.useDeleteCalendarEventMutation).toBe(
        'function'
      )
    })

    it('exports calendar catalog mutations', () => {
      expect(typeof CalendarsApi.useCreateCalendarMutation).toBe('function')
      expect(typeof CalendarsApi.useUpdateCalendarMutation).toBe('function')
      expect(typeof CalendarsApi.useDeleteCalendarMutation).toBe('function')
    })

    it('exports local visibility-only mutation', () => {
      expect(typeof CalendarsApi.useUpdateCalendarVisibilityMutation).toBe(
        'function'
      )
    })

    it('exports calendar share query and mutation', () => {
      expect(typeof CalendarsApi.useGetCalendarShareQuery).toBe('function')
      expect(typeof CalendarsApi.useSetCalendarShareMutation).toBe('function')
    })
  })

  describe('rights normalization', () => {
    const apiRights = {
      can_create_objects: false,
      can_erase_objects: false,
      confidential: 'none',
      private: 'none',
      public: 'view-date-time',
    }
    const calendar = { key: 'c1', name: 'C', description: null }
    const event = {
      key: 'e1',
      id: null,
      calendar_id: 'c1',
      title: 'T',
      all_day: false,
      created_at: '',
      updated_at: '',
    }

    it('keeps rights on a calendar', () => {
      const result = CalendarsApi.normalizeCalendar({
        ...calendar,
        rights: apiRights,
      } as never)
      expect(result.rights).toEqual(apiRights)
    })

    it('keeps rights on an event', () => {
      expect(
        CalendarsApi.normalizeCalendarEvent({
          ...event,
          rights: apiRights,
        } as never).rights
      ).toEqual(apiRights)
    })

    it('fills missing keys with the most restrictive value', () => {
      const result = CalendarsApi.normalizeCalendarEvent({
        ...event,
        rights: { public: 'modify' },
      } as never)
      expect(result.rights).toEqual({
        public: 'modify',
        confidential: 'none',
        private: 'none',
        can_create_objects: false,
        can_erase_objects: false,
      })
    })

    it('ignores non-object rights and omits the rights key', () => {
      const result = CalendarsApi.normalizeCalendar({
        ...calendar,
        rights: 'readwrite',
      } as never)
      expect(result.rights).toBeUndefined()
      expect('rights' in result).toBe(false)
      expect(
        'rights' in CalendarsApi.normalizeCalendarEvent(event as never)
      ).toBe(false)
    })
  })

  describe('setCalendarShareQuery', () => {
    const baseUser = {
      uid: 'jnadal@snapshot.alinto.org',
      c_email: 'jnadal@snapshot.alinto.org',
      userClass: 'normal-user' as const,
      rights: {
        public: 'view-all' as const,
        confidential: 'none' as const,
        private: 'none' as const,
        can_create_objects: true,
        can_erase_objects: false,
      },
    }

    it('should PUT to the calendar share endpoint', () => {
      const query = CalendarsApi.setCalendarShareQuery({
        calendarKey: 'cal-1',
        users: [baseUser],
      })
      expect(query.url).toBe('calendars/cal-1/share')
      expect(query.method).toBe('PUT')
    })

    it('should send the body as a bare array with the full rights object', () => {
      const query = CalendarsApi.setCalendarShareQuery({
        calendarKey: 'cal-1',
        users: [baseUser],
      })
      expect(Array.isArray(query.body)).toBe(true)
      expect(query.body[0]).toEqual({
        c_email: 'jnadal@snapshot.alinto.org',
        uid: 'jnadal@snapshot.alinto.org',
        user_class: 'user',
        rights: baseUser.rights,
      })
    })

    it('should map userClass "any-authenticated-user" to user_class "anyone"', () => {
      const query = CalendarsApi.setCalendarShareQuery({
        calendarKey: 'cal-1',
        users: [{ ...baseUser, userClass: 'any-authenticated-user' }],
      })
      expect(query.body[0].user_class).toBe('anyone')
    })

    it('should encode the calendar key in the URL', () => {
      const query = CalendarsApi.setCalendarShareQuery({
        calendarKey: 'cal with space',
        users: [],
      })
      expect(query.url).toBe('calendars/cal%20with%20space/share')
    })
  })
})
