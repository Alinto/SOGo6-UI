import {
  allDayToLocalDate,
  fromWallClock,
  localDateToAllDayIso,
  toWallClock,
} from '../timezone-wall-clock'

const fields = (d: Date) => [
  d.getFullYear(),
  d.getMonth() + 1,
  d.getDate(),
  d.getHours(),
  d.getMinutes(),
]

describe('timezone-wall-clock', () => {
  it('shows an instant as the wall-clock time of the timezone', () => {
    expect(fields(toWallClock('2026-07-01T12:00:00Z', 'Europe/Paris'))).toEqual(
      [2026, 7, 1, 14, 0]
    )
    expect(
      fields(toWallClock('2026-01-01T03:30:00Z', 'America/New_York'))
    ).toEqual([2025, 12, 31, 22, 30])
  })

  it('reads a wall-clock time back as the right instant', () => {
    expect(
      fromWallClock(new Date(2026, 6, 1, 14, 0), 'Europe/Paris').toISOString()
    ).toBe('2026-07-01T12:00:00.000Z')
    expect(
      fromWallClock(new Date(2026, 0, 1, 9, 0), 'Asia/Tokyo').toISOString()
    ).toBe('2026-01-01T00:00:00.000Z')
  })

  it('round-trips across a DST change', () => {
    const iso = '2026-03-29T01:30:00.000Z' // 03:30 CEST, just after the switch
    const wall = toWallClock(iso, 'Europe/Paris')
    expect(fields(wall)).toEqual([2026, 3, 29, 3, 30])
    expect(fromWallClock(wall, 'Europe/Paris').toISOString()).toBe(iso)
  })

  it('keeps all-day bounds on their UTC calendar day', () => {
    const local = allDayToLocalDate('2026-11-10T00:00:00.000Z')
    expect(fields(local)).toEqual([2026, 11, 10, 0, 0])
    expect(localDateToAllDayIso(local)).toBe('2026-11-10T00:00:00.000Z')
  })
})
