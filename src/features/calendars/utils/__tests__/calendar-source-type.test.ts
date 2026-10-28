import {
  getCalendarFolderScope,
  isPersonalCalendar,
  isSharedCalendar,
  isSubscriptionCalendar,
} from '../calendar-source-type'

describe('calendar-source-type', () => {
  describe('isPersonalCalendar', () => {
    it('includes local and personal backends', () => {
      expect(isPersonalCalendar({ source_type: 'local' })).toBe(true)
      expect(isPersonalCalendar({ source_type: 'personal' })).toBe(true)
      expect(isPersonalCalendar({ source_type: 'caldav' })).toBe(true)
      expect(isPersonalCalendar({})).toBe(true)
    })

    it('excludes shared and subscriptions', () => {
      expect(isPersonalCalendar({ source_type: 'shared' })).toBe(false)
      expect(isPersonalCalendar({ source_type: 'ics' })).toBe(false)
      expect(isPersonalCalendar({ source_type: 'subscription' })).toBe(false)
    })
  })

  describe('isSharedCalendar', () => {
    it('matches shared only', () => {
      expect(isSharedCalendar({ source_type: 'shared' })).toBe(true)
      expect(isSharedCalendar({ source_type: 'local' })).toBe(false)
    })
  })

  describe('isSubscriptionCalendar', () => {
    it('matches ics and subscription', () => {
      expect(isSubscriptionCalendar({ source_type: 'ics' })).toBe(true)
      expect(isSubscriptionCalendar({ source_type: 'subscription' })).toBe(true)
      expect(isSubscriptionCalendar({ source_type: 'local' })).toBe(false)
    })
  })

  describe('getCalendarFolderScope', () => {
    const isOtherOwner = (owner?: string | null) =>
      Boolean(owner) && owner !== 'me@example.com'

    it('puts personal calendars in OWNER', () => {
      expect(
        getCalendarFolderScope({ source_type: 'local' }, isOtherOwner)
      ).toBe('OWNER')
      expect(
        getCalendarFolderScope(
          { source_type: 'local', owner: 'me@example.com' },
          isOtherOwner
        )
      ).toBe('OWNER')
    })

    it('puts shared calendars in SUBS', () => {
      expect(
        getCalendarFolderScope({ owner: 'other@example.com' }, isOtherOwner)
      ).toBe('SUBS')
      expect(
        getCalendarFolderScope({ source_type: 'shared' }, isOtherOwner)
      ).toBe('SUBS')
    })

    it('puts subscriptions in SUBS', () => {
      expect(getCalendarFolderScope({ source_type: 'ics' }, isOtherOwner)).toBe(
        'SUBS'
      )
    })
  })
})
