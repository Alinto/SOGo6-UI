import {
  timezones,
  TimezoneSelect,
  formatTimezoneName,
  getTimezoneOffset,
  getTimezones,
} from '../index'

describe('timezones', () => {
  it('should export timezones data', () => {
    expect(timezones).toBeDefined()
    expect(Array.isArray(timezones)).toBe(true)
  })

  it('should export TimezoneSelect component', () => {
    expect(TimezoneSelect).toBeDefined()
  })

  it('should export formatTimezoneName function', () => {
    expect(typeof formatTimezoneName).toBe('function')
  })

  it('should export getTimezoneOffset function', () => {
    expect(typeof getTimezoneOffset).toBe('function')
  })

  it('should export getTimezones function', () => {
    expect(typeof getTimezones).toBe('function')
  })

  it('should have timezones array with items', () => {
    expect(timezones.length).toBeGreaterThan(0)
  })
})
