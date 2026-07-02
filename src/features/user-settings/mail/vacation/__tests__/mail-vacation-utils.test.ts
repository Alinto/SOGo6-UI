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
    enabled: 1,
    customSubjectEnabled: true,
    customSubject: 'Out of office',
    autoReplyText: 'I am away until Monday.',
    startDate: '2026-06-15',
    endDate: '2026-06-20',
    timezone: 'Europe/Paris',
    alwaysSend: 0,
    ignoreLists: true,
    startTime: '18:00',
    endTime: '08:00',
    weekdaysEnabled: true,
    days: [0, 3, 5],
  }

  describe('createEmptyVacation', () => {
    it('returns default disabled vacation', () => {
      const empty = createEmptyVacation()
      expect(empty.enabled).toBe(false)
      expect(empty.autoReplyText).toBe('')
      expect(empty.constraints.days.monday).toBe(false)
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
      expect(ui.ignoreLists).toBe(true)
    })

    it('maps Sieve weekday numbers to UI booleans', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      expect(ui.constraints.days.sunday).toBe(true)
      expect(ui.constraints.days.wednesday).toBe(true)
      expect(ui.constraints.days.friday).toBe(true)
      expect(ui.constraints.days.monday).toBe(false)
    })
  })

  describe('mapUiVacationToApi', () => {
    it('maps UI vacation to API model', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      const api = mapUiVacationToApi(ui, 'Europe/Paris')

      expect(api.enabled).toBe(1)
      expect(api.customSubjectEnabled).toBe(true)
      expect(api.startDate).toBe('2026-06-15')
      expect(api.endDate).toBe('2026-06-20')
      expect(api.timezone).toBe('Europe/Paris')
      expect(api.days).toEqual([0, 3, 5])
    })

    it('sets customSubjectEnabled false when subject is empty', () => {
      const ui = createEmptyVacation()
      ui.enabled = true
      ui.autoReplyText = 'Away'
      const api = mapUiVacationToApi(ui)
      expect(api.customSubjectEnabled).toBe(false)
    })

    it('nullifies dates when enableDates is false', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      ui.constraints.enableDates = false
      const api = mapUiVacationToApi(ui)
      expect(api.startDate).toBeNull()
      expect(api.endDate).toBeNull()
    })

    it('preserves config when disabled', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      ui.enabled = false
      const api = mapUiVacationToApi(ui)
      expect(api.enabled).toBe(0)
      expect(api.autoReplyText).toBe('I am away until Monday.')
      expect(api.startDate).toBe('2026-06-15')
    })
  })

  describe('round-trip', () => {
    it('preserves data through API → UI → API', () => {
      const ui = mapApiVacationToUi(sampleApiVacation)
      const api = mapUiVacationToApi(ui, 'Europe/Paris')

      expect(api.enabled).toBe(sampleApiVacation.enabled)
      expect(api.customSubject).toBe(sampleApiVacation.customSubject)
      expect(api.autoReplyText).toBe(sampleApiVacation.autoReplyText)
      expect(api.startDate).toBe(sampleApiVacation.startDate)
      expect(api.endDate).toBe(sampleApiVacation.endDate)
      expect(api.startTime).toBe(sampleApiVacation.startTime)
      expect(api.endTime).toBe(sampleApiVacation.endTime)
      expect(api.days).toEqual(sampleApiVacation.days)
      expect(api.ignoreLists).toBe(sampleApiVacation.ignoreLists)
    })

    it('null vacation round-trips to coherent POST payload', () => {
      const ui = mapApiVacationToUi(null)
      const api = mapUiVacationToApi(ui)
      expect(api.enabled).toBe(0)
      expect(api.startDate).toBeNull()
      expect(api.days).toEqual([])
    })
  })
})
