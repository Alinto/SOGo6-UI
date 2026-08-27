import {
  ANY_AUTHENTICATED_UID,
  CALENDAR_CLASSIFICATIONS,
  CALENDAR_SHARE_LEVELS,
  defaultCalendarShareRights,
  hasAnyCalendarRight,
} from '../calendar-permission-mapping'

describe('calendar-permission-mapping', () => {
  describe('ANY_AUTHENTICATED_UID', () => {
    it('is a stable sentinel string', () => {
      expect(ANY_AUTHENTICATED_UID).toBe('anyauthenticated')
    })
  })

  describe('CALENDAR_CLASSIFICATIONS', () => {
    it('has exactly the 3 event classifications in order', () => {
      expect(CALENDAR_CLASSIFICATIONS.map((c) => c.key)).toEqual([
        'public',
        'confidential',
        'private',
      ])
    })

    it('each definition has a labelKey', () => {
      for (const def of CALENDAR_CLASSIFICATIONS) {
        expect(def.labelKey).toEqual(expect.any(String))
        expect(def.labelKey.length).toBeGreaterThan(0)
      }
    })
  })

  describe('CALENDAR_SHARE_LEVELS', () => {
    it('has exactly the 5 permission levels in order', () => {
      expect(CALENDAR_SHARE_LEVELS.map((l) => l.value)).toEqual([
        'none',
        'view-date-time',
        'view-all',
        'respond-to',
        'modify',
      ])
    })

    it('each definition has a labelKey', () => {
      for (const def of CALENDAR_SHARE_LEVELS) {
        expect(def.labelKey).toEqual(expect.any(String))
        expect(def.labelKey.length).toBeGreaterThan(0)
      }
    })
  })

  describe('defaultCalendarShareRights', () => {
    it('defaults every classification to "none" and both booleans to false', () => {
      expect(defaultCalendarShareRights()).toEqual({
        public: 'none',
        confidential: 'none',
        private: 'none',
        can_create_objects: false,
        can_erase_objects: false,
      })
    })

    it('returns a fresh object on every call (not a shared reference)', () => {
      const a = defaultCalendarShareRights()
      const b = defaultCalendarShareRights()
      expect(a).not.toBe(b)
      a.public = 'modify'
      expect(b.public).toBe('none')
    })
  })

  describe('hasAnyCalendarRight', () => {
    it('returns false for the default (all "none"/off) rights', () => {
      expect(hasAnyCalendarRight(defaultCalendarShareRights())).toBe(false)
    })

    it('returns true when a classification is above "none"', () => {
      expect(
        hasAnyCalendarRight({ ...defaultCalendarShareRights(), public: 'view-all' })
      ).toBe(true)
    })

    it('returns true when can_create_objects is on', () => {
      expect(
        hasAnyCalendarRight({
          ...defaultCalendarShareRights(),
          can_create_objects: true,
        })
      ).toBe(true)
    })

    it('returns true when can_erase_objects is on', () => {
      expect(
        hasAnyCalendarRight({
          ...defaultCalendarShareRights(),
          can_erase_objects: true,
        })
      ).toBe(true)
    })
  })
})
