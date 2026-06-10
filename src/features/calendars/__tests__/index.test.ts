import '@testing-library/jest-dom'

import * as Calendars from '../index'

describe('calendars feature index', () => {
  describe('re-exports', () => {
    it('exports type-only re-exports as undefined at runtime (types are erased)', () => {
      expect('Calendar' in Calendars).toBe(false)
    })
  })

  describe('API hooks', () => {
    it('exports useGetCalendarsQuery', () => {
      expect(typeof Calendars.useGetCalendarsQuery).toBe('function')
    })
    it('exports useGetEventsQuery', () => {
      expect(typeof Calendars.useGetEventsQuery).toBe('function')
    })
    it('exports useGetEventsInTimeRangeQuery', () => {
      expect(typeof Calendars.useGetEventsInTimeRangeQuery).toBe('function')
    })
    it('exports useCreateCalendarEventMutation', () => {
      expect(typeof Calendars.useCreateCalendarEventMutation).toBe('function')
    })
    it('exports useUpdateCalendarEventMutation', () => {
      expect(typeof Calendars.useUpdateCalendarEventMutation).toBe('function')
    })
    it('exports useDeleteCalendarEventMutation', () => {
      expect(typeof Calendars.useDeleteCalendarEventMutation).toBe('function')
    })
    it('exports useGetCalendarByIdQuery', () => {
      expect(typeof Calendars.useGetCalendarByIdQuery).toBe('function')
    })
  })
})
