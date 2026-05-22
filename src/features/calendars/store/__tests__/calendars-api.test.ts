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
      expect(typeof CalendarsApi.useGetEventsInTimeRangeQuery).toBe('function')
      expect(typeof CalendarsApi.useGetCalendarEventByIdQuery).toBe('function')
      expect(typeof CalendarsApi.useCreateCalendarEventMutation).toBe('function')
      expect(typeof CalendarsApi.useUpdateCalendarEventMutation).toBe('function')
      expect(typeof CalendarsApi.useDeleteCalendarEventMutation).toBe('function')
    })

    it('exports calendar catalog mutations', () => {
      expect(typeof CalendarsApi.useCreateCalendarMutation).toBe('function')
      expect(typeof CalendarsApi.useUpdateCalendarMutation).toBe('function')
      expect(typeof CalendarsApi.useDeleteCalendarMutation).toBe('function')
    })

    it('exports local visibility-only mutation', () => {
      expect(typeof CalendarsApi.useUpdateCalendarVisibilityMutation).toBe('function')
    })
  })
})
