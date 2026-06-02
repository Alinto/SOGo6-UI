import { isCalendarWritable } from '../is-calendar-writable'

describe('isCalendarWritable', () => {
  it('returns false for undefined calendar', () => {
    expect(isCalendarWritable(undefined)).toBe(false)
  })

  it('returns false for ICS/subscription calendars', () => {
    expect(isCalendarWritable({ source_type: 'ics', name: 'ICS', description: null })).toBe(false)
    expect(isCalendarWritable({ source_type: 'subscription', name: 'Sub', description: null })).toBe(false)
  })

  it('returns true for personal/local/shared calendars', () => {
    expect(isCalendarWritable({ source_type: 'local', name: 'Local', description: null })).toBe(true)
    expect(isCalendarWritable({ source_type: 'shared', name: 'Shared', description: null })).toBe(true)
    expect(isCalendarWritable({ source_type: 'personal', name: 'Personal', description: null })).toBe(true)
  })
})
