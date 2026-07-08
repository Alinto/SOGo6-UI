import type { ApiVacation } from '../mail-vacation-api-types'
import {
  createEmptyVacation,
  formatDateForApi,
  mapApiVacationToUi,
  mapUiVacationToApi,
  parseApiDate,
} from '../mail-vacation-utils'

describe('mail-vacation-utils', () => {
  const sampleApiVacation: ApiVacation = {
    enabled: true,
    custom_subject_enabled: true,
    custom_subject: 'Out of office',
    auto_reply_text: 'I am away until Monday.',
    start_date: '2026-06-15',
    end_date: '2026-06-20',
    timezone: 'Europe/Paris',
    always_send: false,
    start_time: '18:00',
    end_time: '08:00',
    weekdays_enabled: true,
    weekday: [0, 3, 5],
    days: 1,
  }

  describe('createEmptyVacation', () => {
    it('returns default disabled vacation', () => {
      const empty = createEmptyVacation()
      expect(empty.enabled).toBe(false)
      expect(empty.autoReplyText).toBe('')
      expect(empty.constraints.weekdays.monday).toBe(false)
    })
  })

  describe('formatDateForApi / parseApiDate', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2026, 5, 15)
      expect(formatDateForApi(date)).toBe('2026-06-15')
    })

    it('parses API date string', () => {
      const date = parseApiDate('2026-06-15T09:00:00+0100')
      expect(date?.getFullYear()).toBe(2026)
      expect(date?.getMonth()).toBe(5)
      expect(date?.getDate()).toBe(15)
    })
  })

  describe('mapApiVacationToUi', () => {
    it('maps null to empty vacation', () => {
      const ui = mapApiVacationToUi(null)
      expect(ui.enabled).toBe(false)
      expect(ui.constraints.dateRange).toBeNull()
    })

    it('maps API vacation to UI model', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      expect(ui.enabled).toBe(true)
      expect(ui.customSubject).toBe('Out of office')
      expect(ui.autoReplyText).toBe('I am away until Monday.')
      expect(ui.constraints.enableDates).toBe(true)
      expect(ui.constraints.dateRange?.from?.getDate()).toBe(15)
      expect(ui.constraints.enableHours).toBe(true)
      expect(ui.constraints.startTime).toBe('18:00')
      expect(ui.constraints.responseIntervalDays).toBe(1)
    })

    it('maps Sieve weekday numbers to UI booleans', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      expect(ui.constraints.weekdays.sunday).toBe(true)
      expect(ui.constraints.weekdays.wednesday).toBe(true)
      expect(ui.constraints.weekdays.friday).toBe(true)
      expect(ui.constraints.weekdays.monday).toBe(false)
    })

    it('accepts legacy camelCase API payload', () => {
      const ui = mapApiVacationToUi({
        enabled: 1,
        customSubjectEnabled: true,
        customSubject: 'Legacy',
        autoReplyText: 'Away',
        startDate: '2026-06-15',
        endDate: null,
        timezone: 'UTC',
        alwaysSend: 0,
        startTime: null,
        endTime: null,
        weekdaysEnabled: true,
        days: [1, 2],
      })
      expect(ui.customSubject).toBe('Legacy')
      expect(ui.constraints.weekdays.monday).toBe(true)
    })
  })

  describe('mapUiVacationToApi', () => {
    it('maps UI vacation to API model', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      const api = mapUiVacationToApi(ui, 'Europe/Paris')

      expect(api.enabled).toBe(true)
      expect(api.custom_subject_enabled).toBe(true)
      expect(api.start_date).toBe('2026-06-15')
      expect(api.end_date).toBe('2026-06-20')
      expect(api.timezone).toBe('Europe/Paris')
      expect(api.weekday).toEqual([0, 3, 5])
      expect(api.days).toBe(1)
    })

    it('sets custom_subject_enabled false when subject is empty', () => {
      const ui = createEmptyVacation()
      ui.enabled = true
      ui.autoReplyText = 'Away'
      const api = mapUiVacationToApi(ui)
      expect(api.custom_subject_enabled).toBe(false)
    })

    it('nullifies dates when enableDates is false', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      ui.constraints.enableDates = false
      const api = mapUiVacationToApi(ui)
      expect(api.start_date).toBeNull()
      expect(api.end_date).toBeNull()
    })

    it('preserves config when disabled', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      ui.enabled = false
      const api = mapUiVacationToApi(ui)
      expect(api.enabled).toBe(false)
      expect(api.auto_reply_text).toBe('I am away until Monday.')
      expect(api.start_date).toBe('2026-06-15')
    })
  })

  describe('round-trip', () => {
    it('preserves data through API → UI → API', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      const api = mapUiVacationToApi(ui, 'Europe/Paris')

      expect(api.enabled).toBe(sampleApiVacation.enabled)
      expect(api.custom_subject).toBe(sampleApiVacation.custom_subject)
      expect(api.auto_reply_text).toBe(sampleApiVacation.auto_reply_text)
      expect(api.start_date).toBe(sampleApiVacation.start_date)
      expect(api.end_date).toBe(sampleApiVacation.end_date)
      expect(api.start_time).toBe(sampleApiVacation.start_time)
      expect(api.end_time).toBe(sampleApiVacation.end_time)
      expect(api.weekday).toEqual(sampleApiVacation.weekday)
      expect(api.days).toBe(sampleApiVacation.days)
    })

    it('null vacation round-trips to coherent POST payload', () => {
      const ui = mapApiVacationToUi(null)
      const api = mapUiVacationToApi(ui)
      expect(api.enabled).toBe(false)
      expect(api.start_date).toBeNull()
      expect(api.weekday).toEqual([])
    })
  })
})
