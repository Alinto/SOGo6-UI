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

    it('exports folder preferences query and mutation', () => {
      expect(typeof CalendarsApi.useGetFolderPreferencesQuery).toBe('function')
      expect(typeof CalendarsApi.useUpdateFolderPreferencesMutation).toBe(
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

  describe('shared calendars', () => {
    it('exports the shared calendars hooks', () => {
      expect(typeof CalendarsApi.useGetSharedCalendarUsersQuery).toBe(
        'function'
      )
      expect(typeof CalendarsApi.useGetSharedCalendarsByOwnerQuery).toBe(
        'function'
      )
      expect(
        typeof CalendarsApi.useUpdateSharedCalendarSubscriptionMutation
      ).toBe('function')
    })

    it('builds the paginated users query with a trimmed search', () => {
      expect(
        CalendarsApi.getSharedCalendarUsersQuery({
          page: 2,
          page_size: 20,
          search: '  sogo ',
        })
      ).toEqual({
        url: 'shared-calendars/users',
        params: { page: 2, page_size: 20, search: 'sogo' },
      })
    })

    it('omits an empty search from the users query', () => {
      expect(
        CalendarsApi.getSharedCalendarUsersQuery({
          page: 1,
          page_size: 20,
          search: '   ',
        }).params
      ).toEqual({ page: 1, page_size: 20 })
    })

    it("builds the owner's calendars query with an encoded owner", () => {
      expect(CalendarsApi.getSharedCalendarsByOwnerQuery('a b@x.org')).toBe(
        'shared-calendars/a%20b%40x.org'
      )
    })

    it('normalizes the backend users response (mail, no total)', () => {
      expect(
        CalendarsApi.normalizeSharedCalendarUsersResponse({
          data: {
            users: [
              { mail: 'sogo-tests1@example.org', username: 'Didy' },
              { mail: 'nameless@example.org', username: '' },
              { username: 'No mail' },
            ],
          },
          error_code: 'S000000',
          error_msg: 'No Error',
        })
      ).toEqual({
        users: [
          { owner: 'sogo-tests1@example.org', username: 'Didy' },
          { owner: 'nameless@example.org', username: 'nameless@example.org' },
        ],
      })
    })

    it('keeps the total and accepts `owner` when the backend sends them', () => {
      expect(
        CalendarsApi.normalizeSharedCalendarUsersResponse({
          users: [{ owner: 'a@x.org', username: 'A' }],
          total_count: 42,
        })
      ).toEqual({
        users: [{ owner: 'a@x.org', username: 'A' }],
        total_count: 42,
      })
    })

    it('takes the totals from the X-Pagination header', () => {
      expect(
        CalendarsApi.normalizeSharedCalendarUsersResponse(
          { data: { users: [{ mail: 'a@x.org', username: 'A' }] } },
          { total: 21, totalPages: 2, page: 1 }
        )
      ).toEqual({
        users: [{ owner: 'a@x.org', username: 'A' }],
        total_count: 21,
        total_pages: 2,
      })
    })
    it('builds the subscribe query with an encoded key', () => {
      expect(
        CalendarsApi.updateSharedCalendarSubscriptionQuery({
          key: 'cal 1',
          subscribe: true,
        })
      ).toEqual({
        url: 'shared-calendars/cal%201',
        method: 'PUT',
        body: { subscribe: 1 },
      })
    })

    it('builds the unsubscribe query', () => {
      expect(
        CalendarsApi.updateSharedCalendarSubscriptionQuery({
          key: 'cal-1',
          subscribe: false,
        })
      ).toEqual({
        url: 'shared-calendars/cal-1',
        method: 'PUT',
        body: { subscribe: 0 },
      })
    })

    it("normalizes the wrapped owner's calendars response", () => {
      const result = CalendarsApi.normalizeSharedCalendarsResponse({
        data: {
          calendars: [
            {
              key: 'cal-1',
              name: 'Personal calendar',
              description: null,
              owner: 'sogo-tests1@example.org',
              name_owner: 'Sogo test1',
              subscribed: true,
            },
          ],
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      } as never)
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        key: 'cal-1',
        id: 'cal-1',
        owner: 'sogo-tests1@example.org',
        name_owner: 'Sogo test1',
        subscribed: true,
      })
    })

    it('fills in the owner and the subscription flag when they are missing', () => {
      const [calendar] = CalendarsApi.normalizeSharedCalendarsResponse(
        {
          data: [{ key: 'cal-2', name: 'Holidays', description: null }],
        } as never,
        'sogo-tests2@example.org'
      )
      expect(calendar).toMatchObject({
        key: 'cal-2',
        owner: 'sogo-tests2@example.org',
        name_owner: null,
        subscribed: false,
      })
    })
  })
})
