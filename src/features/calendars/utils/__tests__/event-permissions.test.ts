import type {
  Calendar,
  CalendarShareRights,
} from '@/features/calendars/calendars-types'
import { findCalendarByRef, getEventPermissions } from '../event-permissions'

const rights = (
  overrides: Partial<CalendarShareRights>
): CalendarShareRights => ({
  public: 'none',
  confidential: 'none',
  private: 'none',
  can_create_objects: false,
  can_erase_objects: false,
  ...overrides,
})

const calendar = (overrides: Partial<Calendar> = {}): Calendar => ({
  key: 'cal-1',
  name: 'Cal',
  description: null,
  source_type: 'shared',
  ...overrides,
})

describe('findCalendarByRef', () => {
  const calendars = [calendar({ key: 'a' }), calendar({ key: 'b', id: 'b-id' })]

  it('matches on key or id', () => {
    expect(findCalendarByRef(calendars, 'a')).toBe(calendars[0])
    expect(findCalendarByRef(calendars, 'b-id')).toBe(calendars[1])
  })

  it('returns undefined for empty refs or unknown calendars', () => {
    expect(findCalendarByRef(calendars, '')).toBeUndefined()
    expect(findCalendarByRef(calendars, null)).toBeUndefined()
    expect(findCalendarByRef(calendars, 'zzz')).toBeUndefined()
    expect(findCalendarByRef(undefined, 'a')).toBeUndefined()
  })
})

describe('getEventPermissions', () => {
  describe('without rights (legacy backend)', () => {
    it('grants everything on a writable calendar', () => {
      expect(getEventPermissions({}, calendar())).toEqual({
        level: 'modify',
        canViewDetails: true,
        canModify: true,
        canDelete: true,
      })
    })

    it('keeps viewing but blocks edit/delete on subscription calendars', () => {
      const perms = getEventPermissions(
        {},
        calendar({ source_type: 'subscription' })
      )
      expect(perms.canViewDetails).toBe(true)
      expect(perms.canModify).toBe(false)
      expect(perms.canDelete).toBe(false)
    })

    it('blocks edit/delete when the calendar is unknown', () => {
      const perms = getEventPermissions({}, undefined)
      expect(perms.canModify).toBe(false)
      expect(perms.canDelete).toBe(false)
    })
  })

  describe('with event rights', () => {
    it('hides details when only the date/time is viewable', () => {
      const perms = getEventPermissions(
        {
          visibility: 'public',
          rights: rights({ public: 'view-date-time' }),
        },
        calendar()
      )
      expect(perms).toEqual({
        level: 'view-date-time',
        canViewDetails: false,
        canModify: false,
        canDelete: false,
      })
    })

    it('allows viewing details with view-all but not modifying', () => {
      const perms = getEventPermissions(
        { visibility: 'public', rights: rights({ public: 'view-all' }) },
        calendar()
      )
      expect(perms.canViewDetails).toBe(true)
      expect(perms.canModify).toBe(false)
    })

    it('allows modifying with modify, deleting only with can_erase_objects', () => {
      const event = {
        visibility: 'public' as const,
        rights: rights({ public: 'modify' }),
      }
      expect(getEventPermissions(event, calendar())).toMatchObject({
        canModify: true,
        canDelete: false,
      })
      expect(
        getEventPermissions(
          {
            ...event,
            rights: rights({ public: 'modify', can_erase_objects: true }),
          },
          calendar()
        )
      ).toMatchObject({ canModify: true, canDelete: true })
    })

    it('uses the level of the event classification', () => {
      const eventRights = rights({
        public: 'modify',
        confidential: 'view-date-time',
        private: 'none',
      })
      expect(
        getEventPermissions(
          { visibility: 'public', rights: eventRights },
          calendar()
        ).level
      ).toBe('modify')
      expect(
        getEventPermissions(
          { visibility: 'confidential', rights: eventRights },
          calendar()
        ).level
      ).toBe('view-date-time')
      expect(
        getEventPermissions(
          { visibility: 'private', rights: eventRights },
          calendar()
        )
      ).toMatchObject({ level: 'none', canViewDetails: false })
    })

    it('treats an event without visibility as public', () => {
      const perms = getEventPermissions(
        { rights: rights({ public: 'modify' }) },
        calendar()
      )
      expect(perms.canModify).toBe(true)
    })

    it('never allows edit/delete on subscription calendars', () => {
      const perms = getEventPermissions(
        {
          visibility: 'public',
          rights: rights({ public: 'modify', can_erase_objects: true }),
        },
        calendar({ source_type: 'ics' })
      )
      expect(perms.canModify).toBe(false)
      expect(perms.canDelete).toBe(false)
    })
  })

  it('falls back to the calendar rights when the event has none', () => {
    const perms = getEventPermissions(
      { visibility: 'private' },
      calendar({ rights: rights({ private: 'view-all' }) })
    )
    expect(perms).toMatchObject({
      level: 'view-all',
      canViewDetails: true,
      canModify: false,
    })
  })

  it('prefers the event rights over the calendar rights', () => {
    const perms = getEventPermissions(
      { visibility: 'public', rights: rights({ public: 'none' }) },
      calendar({ rights: rights({ public: 'modify' }) })
    )
    expect(perms.level).toBe('none')
    expect(perms.canModify).toBe(false)
  })
})
