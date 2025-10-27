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
        type: 'personal',
        default: true,
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
        type: 'personal',
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
        type: 'shared',
        owner: 'admin@example.com',
        permissions: 'readwrite',
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
        type: 'subscription',
        read_only: true,
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
      expect(calendar.type).toBeDefined()
      expect(['personal', 'shared', 'subscription']).toContain(calendar.type)
    })

    it('Calendar optional fields should be properly typed', () => {
      const calendarWithOptionals: Calendar = {
        id: 'cal-1',
        name: 'Test',
        description: 'Test',
        type: 'personal',
        color: '#FF0000',
        default: true,
        read_only: false,
        owner: 'user@example.com',
        permissions: 'readwrite',
        url: 'https://example.com/calendar',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(calendarWithOptionals.color).toBe('#FF0000')
      expect(calendarWithOptionals.default).toBe(true)
      expect(calendarWithOptionals.read_only).toBe(false)
      expect(calendarWithOptionals.owner).toBe('user@example.com')
      expect(calendarWithOptionals.permissions).toBe('readwrite')
      expect(calendarWithOptionals.url).toBe('https://example.com/calendar')
    })
  })

  describe('Calendar Type Variants', () => {
    it('should support personal calendar type', () => {
      const personal: Calendar = {
        id: 'p1',
        name: 'Personal',
        description: 'Personal calendar',
        type: 'personal',
      }
      expect(personal.type).toBe('personal')
    })

    it('should support shared calendar type', () => {
      const shared: Calendar = {
        id: 's1',
        name: 'Shared',
        description: 'Shared calendar',
        type: 'shared',
        owner: 'admin@example.com',
      }
      expect(shared.type).toBe('shared')
    })

    it('should support subscription calendar type', () => {
      const subscription: Calendar = {
        id: 'sub1',
        name: 'Subscription',
        description: 'Subscription calendar',
        type: 'subscription',
        url: 'https://example.com/cal.ics',
      }
      expect(subscription.type).toBe('subscription')
    })
  })

  describe('Permission Models', () => {
    it('should support readwrite permission', () => {
      const calendar: Calendar = {
        id: 'c1',
        name: 'Calendar',
        description: 'Test',
        type: 'shared',
        permissions: 'readwrite',
      }
      expect(calendar.permissions).toBe('readwrite')
    })

    it('should support read-only permission', () => {
      const calendar: Calendar = {
        id: 'c1',
        name: 'Calendar',
        description: 'Test',
        type: 'shared',
        permissions: 'read',
      }
      expect(calendar.permissions).toBe('read')
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
    it('should group calendars by type in response', () => {
      const response = mockCalendarsResponse

      // Personal calendars
      expect(response.personal.length).toBe(2)
      expect(response.personal.every((c) => c.type === 'personal')).toBe(true)
      expect(response.personal.some((c) => c.default)).toBe(true)

      // Shared calendars
      expect(response.shared.length).toBe(1)
      expect(response.shared[0].type).toBe('shared')
      expect(response.shared[0].owner).toBe('admin@example.com')

      // Subscription calendars
      expect(response.subscriptions.length).toBe(1)
      expect(response.subscriptions[0].type).toBe('subscription')
      expect(response.subscriptions[0].read_only).toBe(true)
    })

    it('should maintain calendar structure consistency', () => {
      const response = mockCalendarsResponse
      const allCalendars = [
        ...response.personal,
        ...response.shared,
        ...response.subscriptions,
      ]

      // All should have required fields
      allCalendars.forEach((cal) => {
        expect(cal.id).toBeTruthy()
        expect(cal.name).toBeTruthy()
        expect(cal.description).toBeTruthy()
        expect(cal.type).toBeTruthy()
      })

      // IDs should be unique
      const ids = allCalendars.map((c) => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })
})
