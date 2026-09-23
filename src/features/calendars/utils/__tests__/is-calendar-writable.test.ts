import { isCalendarWritable } from '../is-calendar-writable'

describe('isCalendarWritable', () => {
  it('returns false for undefined calendar', () => {
    expect(isCalendarWritable(undefined)).toBe(false)
  })

  it('returns false for ICS/subscription calendars', () => {
    expect(
      isCalendarWritable({ source_type: 'ics', name: 'ICS', description: null })
    ).toBe(false)
    expect(
      isCalendarWritable({
        source_type: 'subscription',
        name: 'Sub',
        description: null,
      })
    ).toBe(false)
  })

  it('returns true for personal/local/shared calendars', () => {
    expect(
      isCalendarWritable({
        source_type: 'local',
        name: 'Local',
        description: null,
      })
    ).toBe(true)
    expect(
      isCalendarWritable({
        source_type: 'shared',
        name: 'Shared',
        description: null,
      })
    ).toBe(true)
    expect(
      isCalendarWritable({
        source_type: 'personal',
        name: 'Personal',
        description: null,
      })
    ).toBe(true)
  })
})

describe('isCalendarWritable with rights', () => {
  const rights = (can_create_objects: boolean) => ({
    public: 'none' as const,
    confidential: 'none' as const,
    private: 'none' as const,
    can_create_objects,
    can_erase_objects: false,
  })

  it('follows can_create_objects when rights are provided', () => {
    expect(
      isCalendarWritable({
        source_type: 'shared',
        name: 'S',
        description: null,
        rights: rights(true),
      })
    ).toBe(true)
    expect(
      isCalendarWritable({
        source_type: 'shared',
        name: 'S',
        description: null,
        rights: rights(false),
      })
    ).toBe(false)
  })

  it('stays read-only for subscription calendars even with can_create_objects', () => {
    expect(
      isCalendarWritable({
        source_type: 'ics',
        name: 'I',
        description: null,
        rights: rights(true),
      })
    ).toBe(false)
  })
})
