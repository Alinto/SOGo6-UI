import {
  DEFAULT_VACATION,
  EMPTY_WEEKDAYS,
  SIEVE_WEEKDAY_BY_UI_KEY,
  TIME_FORMAT_REGEX,
  UI_WEEKDAY_BY_SIEVE_DAY,
  UI_WEEKDAY_KEYS,
} from '../mail-vacation-constants'

describe('mail-vacation-constants', () => {
  it('validates 24-hour time strings', () => {
    expect(TIME_FORMAT_REGEX.test('09:30')).toBe(true)
    expect(TIME_FORMAT_REGEX.test('23:59')).toBe(true)
    expect(TIME_FORMAT_REGEX.test('24:00')).toBe(false)
    expect(TIME_FORMAT_REGEX.test('9:30')).toBe(false)
  })

  it('maps UI weekday keys to sieve day numbers and back', () => {
    expect(SIEVE_WEEKDAY_BY_UI_KEY.monday).toBe(1)
    expect(UI_WEEKDAY_BY_SIEVE_DAY[1]).toBe('monday')
    expect(UI_WEEKDAY_KEYS).toHaveLength(7)
  })

  it('provides empty defaults for vacation settings', () => {
    expect(EMPTY_WEEKDAYS.monday).toBe(false)
    expect(DEFAULT_VACATION.enabled).toBe(false)
    expect(DEFAULT_VACATION.constraints.startTime).toBe('18:00')
    expect(DEFAULT_VACATION.constraints.weekdays).toEqual(EMPTY_WEEKDAYS)
  })
})
