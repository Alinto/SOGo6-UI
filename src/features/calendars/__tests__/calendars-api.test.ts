import { Calendar, CalendarsResponse, EventReminder } from '../calendars-types'

/**
 * Tests for calendars types and RTK Query integration
 * Verifies proper type definitions for the calendars feature
 */
describe('Calendars Types and API', () => {
  const mockCalendarsResponse: CalendarsResponse = {
    personal: [
      {
        id: 'personal-1',
        name: 'Personal',
        description: 'My personal calendar',
        source_type: 'personal',
        is_default: true,
        color: '#FF5733',
        event_duration: 30,
        show_as_busy: true,
        event_notifications: [{ method: 'popup', minutes_before: 0 }],
        all_day_notifications: [{ method: 'popup', minutes_before: 1440 }],
      },
      {
        id: 'personal-2',
        name: 'Work',
        description: 'Work calendar',
        source_type: 'personal',
        color: '#33FF57',
        event_duration: 60,
        show_as_busy: true,
        event_notifications: [
          { method: 'popup', minutes_before: 0 },
          { method: 'email', minutes_before: 15 },
        ],
        all_day_notifications: [
          { method: 'popup', minutes_before: 1440 },
          { method: 'email', minutes_before: 1440 },
        ],
      },
    ],
    shared: [
      {
        id: 'shared-1',
        name: 'Team Calendar',
        description: 'Team calendar',
        source_type: 'shared',
        owner_uid: 'admin@example.com',
        color: '#3357FF',
        event_duration: 60,
        show_as_busy: true,
        event_notifications: [{ method: 'popup', minutes_before: 0 }],
        all_day_notifications: [{ method: 'popup', minutes_before: 1440 }],
      },
    ],
    subscriptions: [
      {
        id: 'sub-1',
        name: 'Holidays',
        description: 'Public holidays',
        source_type: 'subscription',
        url: 'https://example.com/holidays.ics',
        event_notifications: [],
        all_day_notifications: [],
      },
    ],
  }

  describe('Response Types', () => {
    it('should have CalendarsResponse interface with all properties', () => {
      const response: CalendarsResponse = mockCalendarsResponse

      expect(response.personal).toBeDefined()
      expect(response.shared).toBeDefined()
      expect(response.subscriptions).toBeDefined()
      expect(Array.isArray(response.personal)).toBe(true)
      expect(Array.isArray(response.shared)).toBe(true)
      expect(Array.isArray(response.subscriptions)).toBe(true)
    })

    it('Calendar type should have all required fields', () => {
      const calendar: Calendar = mockCalendarsResponse.personal[0]

      expect(calendar.id).toBeDefined()
      expect(calendar.name).toBeDefined()
      expect(calendar.description).toBeDefined()
      expect(calendar.source_type).toBeDefined()
      expect(['personal', 'shared', 'subscription', 'ics']).toContain(
        calendar.source_type
      )
    })

    it('Calendar optional fields should be properly typed', () => {
      const calendarWithOptionals: Calendar = {
        id: 'cal-1',
        name: 'Test',
        description: 'Test',
        source_type: 'personal',
        color: '#FF0000',
        is_default: true,
        owner_uid: 'user@example.com',
        url: 'https://example.com/calendar',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(calendarWithOptionals.color).toBe('#FF0000')
      expect(calendarWithOptionals.is_default).toBe(true)
      expect(calendarWithOptionals.owner_uid).toBe('user@example.com')
      expect(calendarWithOptionals.url).toBe('https://example.com/calendar')
    })
  })

  describe('Calendar source_type variants', () => {
    it('should support personal calendar source_type', () => {
      const personal: Calendar = {
        id: 'p1',
        name: 'Personal',
        description: 'Personal calendar',
        source_type: 'personal',
      }
      expect(personal.source_type).toBe('personal')
    })

    it('should support shared calendar source_type', () => {
      const shared: Calendar = {
        id: 's1',
        name: 'Shared',
        description: 'Shared calendar',
        source_type: 'shared',
        owner_uid: 'admin@example.com',
      }
      expect(shared.source_type).toBe('shared')
    })

    it('should support subscription calendar source_type with url', () => {
      const subscription: Calendar = {
        id: 'sub1',
        name: 'Subscription',
        description: 'Subscription calendar',
        source_type: 'subscription',
        url: 'https://example.com/cal.ics',
      }
      expect(subscription.source_type).toBe('subscription')
      expect(subscription.url).toBe('https://example.com/cal.ics')
    })
  })

  describe('Event Notification Configuration', () => {
    it('should support event notifications with method and minutes_before', () => {
      const notification: EventReminder = {
        method: 'popup',
        minutes_before: 0,
      }
      expect(notification.method).toBe('popup')
      expect(notification.minutes_before).toBe(0)
    })

    it('should support email notifications', () => {
      const notification: EventReminder = {
        method: 'email',
        minutes_before: 15,
      }
      expect(notification.method).toBe('email')
      expect(notification.minutes_before).toBe(15)
    })

    it('should have multiple event notifications', () => {
      const calendar = mockCalendarsResponse.personal[1]
      expect(Array.isArray(calendar.event_notifications)).toBe(true)
      expect(calendar.event_notifications?.length).toBeGreaterThan(0)
    })
  })

  describe('All-Day Event Notification Configuration', () => {
    it('should support all-day notifications with minutes_before', () => {
      const notification: EventReminder = {
        method: 'popup',
        minutes_before: 1440,
      }
      expect(notification.method).toBe('popup')
      expect(notification.minutes_before).toBe(1440)
    })

    it('should support email all-day notifications', () => {
      const notification: EventReminder = {
        method: 'email',
        minutes_before: 1440,
      }
      expect(notification.method).toBe('email')
      expect(notification.minutes_before).toBe(1440)
    })

    it('should have all-day notifications array', () => {
      const calendar = mockCalendarsResponse.personal[0]
      expect(Array.isArray(calendar.all_day_notifications)).toBe(true)
    })
  })

  describe('Calendar Event Settings', () => {
    it('should have event_duration field in minutes', () => {
      const calendar = mockCalendarsResponse.personal[0]
      expect(calendar.event_duration).toBeDefined()
      expect(typeof calendar.event_duration).toBe('number')
      expect(calendar.event_duration).toBeGreaterThanOrEqual(0)
    })

    it('should have show_as_busy boolean field', () => {
      const calendar = mockCalendarsResponse.personal[0]
      expect(calendar.show_as_busy).toBeDefined()
      expect(typeof calendar.show_as_busy).toBe('boolean')
    })
  })

  describe('Calendar Collection Response', () => {
    it('should group calendars by category in response', () => {
      const response = mockCalendarsResponse

      expect(response.personal.length).toBe(2)
      expect(response.personal.every((c) => c.source_type === 'personal')).toBe(
        true
      )
      expect(response.personal.some((c) => c.is_default)).toBe(true)

      expect(response.shared.length).toBe(1)
      expect(response.shared[0].source_type).toBe('shared')
      expect(response.shared[0].owner_uid).toBe('admin@example.com')

      expect(response.subscriptions.length).toBe(1)
      expect(response.subscriptions[0].source_type).toBe('subscription')
      expect(response.subscriptions[0].url).toBeDefined()
    })

    it('should maintain calendar structure consistency', () => {
      const response = mockCalendarsResponse
      const allCalendars = [
        ...response.personal,
        ...response.shared,
        ...response.subscriptions,
      ]

      allCalendars.forEach((cal) => {
        expect(cal.id).toBeTruthy()
        expect(cal.name).toBeTruthy()
        expect(cal.description).toBeTruthy()
        expect(cal.source_type).toBeTruthy()
      })

      const ids = allCalendars.map((c) => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })
})
