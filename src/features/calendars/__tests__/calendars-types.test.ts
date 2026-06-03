import '@testing-library/jest-dom'

import type {
  ApiCalendarEventResponse,
  ApiCalendarResponse,
  ApiCalendarsResponse,
  ApiCalendarEventsResponse,
  Calendar,
  CalendarCreateBody,
  CalendarEvent,
  CalendarEventCreateBody,
  CalendarEventQueryArgs,
  CalendarEventUpdateBody,
  CalendarEventsResponse,
  CalendarType,
  CalendarUpdateBody,
  CalendarsResponse,
  EventAttendee,
  EventRecurrence,
  EventReminder,
} from '../calendars-types'

describe('calendars-types', () => {
  describe('EventAttendee', () => {
    it('accepts a minimal attendee shape', () => {
      const a: EventAttendee = { email: 'a@b.com' }
      expect(a.email).toBe('a@b.com')
    })
  })

  describe('EventRecurrence', () => {
    it('accepts daily frequency', () => {
      const r: EventRecurrence = { frequency: 'daily' }
      expect(r.frequency).toBe('daily')
    })
  })

  describe('EventReminder', () => {
    it('accepts popup reminder', () => {
      const e: EventReminder = { method: 'popup', minutes_before: 15 }
      expect(e.minutes_before).toBe(15)
    })
  })

  describe('CalendarEvent', () => {
    it('accepts required fields and backend aliases', () => {
      const ev: CalendarEvent = {
        id: '1',
        calendar_id: 'cal-1',
        title: 'Meet',
        all_day: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        date_start: '2024-01-01T10:00:00Z',
        date_end: '2024-01-01T11:00:00Z',
        end_date: '2024-01-01T11:00:00Z',
        calendar_key: 'cal-1',
      }
      expect(ev.title).toBe('Meet')
      expect(ev.all_day).toBe(false)
    })
  })

  describe('CalendarEventsResponse', () => {
    it('holds events array', () => {
      const r: CalendarEventsResponse = { events: [], total_count: 0 }
      expect(r.events).toEqual([])
    })
  })

  describe('CalendarEventQueryArgs', () => {
    it('accepts range filters', () => {
      const q: CalendarEventQueryArgs = {
        start_date_time: 'A',
        end_date_time: 'B',
        search: 'q',
      }
      expect(q.search).toBe('q')
    })
  })

  describe('CalendarEventCreateBody', () => {
    it('requires title and date range', () => {
      const b: CalendarEventCreateBody = {
        title: 'T',
        date_start: '2024-01-01T00:00:00Z',
        date_end: '2024-01-01T01:00:00Z',
      }
      expect(b.title).toBe('T')
    })
  })

  describe('CalendarEventUpdateBody', () => {
    it('is partial of create body', () => {
      const u: CalendarEventUpdateBody = { title: 'U' }
      expect(u.title).toBe('U')
    })
  })

  describe('Api responses', () => {
    it('ApiCalendarEventResponse has envelope', () => {
      const e: ApiCalendarEventResponse = {
        data: {} as CalendarEvent,
        error_code: '0',
        error_msg: '',
      }
      expect(e.error_code).toBe('0')
    })

    it('ApiCalendarsResponse has envelope with calendars', () => {
      const a: ApiCalendarsResponse = {
        data: { calendars: [], total_count: 0 },
        error_code: '0',
        error_msg: '',
      }
      expect(a.data.total_count).toBe(0)
    })

    it('ApiCalendarEventsResponse lists events', () => {
      const a: ApiCalendarEventsResponse = {
        data: { events: [], total_count: 0 },
        error_code: '0',
        error_msg: '',
      }
      expect(a.data.events).toEqual([])
    })

    it('ApiCalendarResponse has single calendar', () => {
      const a: ApiCalendarResponse = {
        data: {} as Calendar,
        error_code: '0',
        error_msg: '',
      }
      expect(a.data).toBeDefined()
    })
  })

  describe('Calendar', () => {
    it('accepts a minimal personal calendar', () => {
      const c: Calendar = {
        name: 'Home',
        description: null,
      }
      expect(c.name).toBe('Home')
    })
  })

  describe('CalendarsResponse', () => {
    it('groups by category', () => {
      const r: CalendarsResponse = {
        personal: [],
        shared: [],
        subscriptions: [],
      }
      expect(r.personal).toEqual([])
    })
  })

  describe('CalendarType', () => {
    it('narrows to known kinds', () => {
      const t: CalendarType = 'personal'
      expect(t).toBe('personal')
    })
  })

  describe('CalendarCreateBody & CalendarUpdateBody', () => {
    it('create requires name', () => {
      const c: CalendarCreateBody = { name: 'C' }
      expect(c.name).toBe('C')
    })

    it('update can patch partial fields', () => {
      const u: CalendarUpdateBody = { color: '#fff' }
      expect(u.color).toBe('#fff')
    })
  })
})
