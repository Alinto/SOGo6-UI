import {
  CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH,
  CALENDAR_EVENT_LOCATION_MAX_LENGTH,
  CALENDAR_EVENT_TITLE_MAX_LENGTH,
  CALENDAR_TEXT_SEARCH_MAX_LENGTH,
} from '../calendar-constants'

describe('calendar-constants', () => {
  describe('CALENDAR_EVENT_TITLE_MAX_LENGTH', () => {
    it('matches backend CalendarConst title limit', () => {
      expect(CALENDAR_EVENT_TITLE_MAX_LENGTH).toBe(500)
    })
  })

  describe('CALENDAR_EVENT_LOCATION_MAX_LENGTH', () => {
    it('matches backend CalendarConst location limit', () => {
      expect(CALENDAR_EVENT_LOCATION_MAX_LENGTH).toBe(500)
    })
  })

  describe('CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH', () => {
    it('matches backend CalendarConst description limit', () => {
      expect(CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH).toBe(10_000)
    })
  })

  describe('CALENDAR_TEXT_SEARCH_MAX_LENGTH', () => {
    it('matches backend CalendarConst text search limit', () => {
      expect(CALENDAR_TEXT_SEARCH_MAX_LENGTH).toBe(200)
    })
  })
})
