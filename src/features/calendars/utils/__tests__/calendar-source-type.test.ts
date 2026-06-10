import {
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
})
