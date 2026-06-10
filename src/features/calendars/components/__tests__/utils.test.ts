import '@testing-library/jest-dom'
import type { Day, TeamMember } from '../utils'
import {
  generateAvailabilityData,
  getAllAvailableSlots,
  getDayKey,
  getVisibleHours,
  isPartOfOptimalSlot,
  isQuarterBusy,
  mapBackendFreeBusyToAvailability,
  parseCompactUtc,
} from '../utils'

describe('calendar free/busy utils', () => {
  describe('parseCompactUtc', () => {
    it('parses compact UTC strings into the correct instant', () => {
      const d = parseCompactUtc('20260511T090000Z')
      expect(d.toISOString()).toBe('2026-05-11T09:00:00.000Z')
    })
  })

  describe('getDayKey', () => {
    it('returns the date string unchanged', () => {
      expect(getDayKey('2026-05-18')).toBe('2026-05-18')
    })
  })

  describe('getVisibleHours', () => {
    it('clamps the visible window around working hours', () => {
      const hours = getVisibleHours({ start: 9, end: 17 })
      expect(hours[0]).toBeGreaterThanOrEqual(6)
      expect(hours[hours.length - 1]).toBeLessThanOrEqual(22)
      expect(hours).toContain(9)
      expect(hours).toContain(17)
    })
  })

  describe('isQuarterBusy', () => {
    it('returns true when the quarter overlaps a busy period', () => {
      const busy = [
        {
          from: '2026-05-18T15:00:00.000Z',
          to: '2026-05-18T17:30:00.000Z',
        },
      ]
      expect(isQuarterBusy('2026-05-18', 16, 0, busy)).toBe(true)
    })

    it('returns false when the quarter is outside busy periods', () => {
      const busy = [
        {
          from: '2026-05-18T15:00:00.000Z',
          to: '2026-05-18T17:30:00.000Z',
        },
      ]
      expect(isQuarterBusy('2026-05-18', 17, 2, busy)).toBe(false)
    })
  })

  describe('mapBackendFreeBusyToAvailability', () => {
    const team: TeamMember[] = [
      { name: 'User', email: 'user@example.com' },
    ]

    it('maps busy periods to ISO from/to per UTC calendar day', () => {
      const out = mapBackendFreeBusyToAvailability(
        {
          'user@example.com': {
            periods: [
              {
                start: '20260518T150000Z',
                end: '20260518T173000Z',
                type: 'busy',
              },
            ],
          },
        },
        team
      )
      const periods = out['user@example.com']?.['2026-05-18'] ?? []
      expect(periods).toHaveLength(1)
      expect(periods[0].from).toContain('2026-05-18T15:00:00')
      expect(periods[0].to).toContain('2026-05-18T17:30:00')
    })

    it('ignores free periods', () => {
      const out = mapBackendFreeBusyToAvailability(
        {
          'user@example.com': {
            periods: [
              {
                start: '20260518T100000Z',
                end: '20260518T110000Z',
                type: 'free',
              },
            ],
          },
        },
        team
      )
      expect(out['user@example.com']?.['2026-05-18'] ?? []).toHaveLength(0)
    })

    it('resolves attendee keys case-insensitively', () => {
      const out = mapBackendFreeBusyToAvailability(
        {
          'USER@EXAMPLE.COM': {
            periods: [
              {
                start: '20260518T120000Z',
                end: '20260518T130000Z',
                type: 'busy',
              },
            ],
          },
        },
        team
      )
      expect(out['user@example.com']?.['2026-05-18']).toHaveLength(1)
    })
  })

  describe('getAllAvailableSlots and isPartOfOptimalSlot', () => {
    const gridDay: Day = {
      date: '2026-05-18',
      dayName: 'Mon',
      dayMonth: 'May 18',
      dayOfWeek: 1,
    }

    it('returns no slots when there are no participants', () => {
      expect(getAllAvailableSlots([gridDay], [], 60)).toEqual([])
    })

    it('finds a mutual free window after overlapping busy blocks', () => {
      const { data: persons } = generateAvailabilityData(
        [
          { name: 'Alice', email: 'alice@x.com' },
          { name: 'Bob', email: 'bob@x.com' },
        ],
        [1, 2, 3, 4, 5],
        { start: 0, end: 23 },
        {
          'bob@x.com': {
            '2026-05-18': [
              {
                from: '2026-05-18T15:00:00.000Z',
                to: '2026-05-18T17:30:00.000Z',
              },
            ],
          },
        },
        [gridDay]
      )

      const slots = getAllAvailableSlots([gridDay], persons, 60)
      const start17_30 = Date.UTC(2026, 4, 18, 17, 30, 0, 0)
      expect(slots.some((s) => s.startMs === start17_30)).toBe(true)

      expect(
        isPartOfOptimalSlot(slots, '2026-05-18', 17, 0)
      ).toBe(false)
      expect(
        isPartOfOptimalSlot(slots, '2026-05-18', 17, 2)
      ).toBe(true)
    })
  })
})
