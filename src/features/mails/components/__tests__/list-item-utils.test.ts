import { formatDate } from '../list-item-utils'

describe('list-item-utils', () => {
  describe('formatDate', () => {
    const now = new Date()

    it('should format date as "X min ago" for times less than 1 hour ago today', () => {
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
      const result = formatDate(fiveMinutesAgo.toISOString())
      expect(result).toMatch(/^\d+ min ago$/)
    })

    it("should format today's date as HH:mm", () => {
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      const result = formatDate(twoHoursAgo.toISOString())
      expect(result).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/)
    })

    it('should format dates from this week as day name', () => {
      // Get a date from earlier this week (not today)
      const daysAgo = now.getDay() > 0 ? now.getDay() : 7
      const dateFromThisWeek = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000
      )
      const result = formatDate(dateFromThisWeek.toISOString())
      const weekdays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]
      expect(weekdays).toContain(result)
    })

    it('should format dates from previous years as "MMM D, YYYY"', () => {
      const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      const result = formatDate(lastYear.toISOString())
      // Should contain month, day, and year separated by spaces and comma
      expect(result).toMatch(/^[A-Z][a-z]{2}\s\d{1,2},\s\d{4}$/)
    })

    it('should format dates from this year as "MMM D"', () => {
      // Mock the current date to ensure consistent test results
      const mockNow = new Date(2025, 10, 8) // October 8, 2025
      const realDateConstructor = Date

      jest.spyOn(global, 'Date').mockImplementation((...args: any[]) => {
        if (args.length === 0) {
          return mockNow as any
        }
        return new realDateConstructor(...args) as any
      })

      // Get a date from 2 months ago (but still this year)
      const twoMonthsAgo = new Date(2025, 8, 8) // August 8, 2024 (before Jan 8, 2025)
      const result = formatDate(twoMonthsAgo.toISOString())
      expect(result).toMatch(/^[A-Z][a-z]{2}\s\d{1,2}$/)

      jest.restoreAllMocks()
    })

    it('should handle leap year dates correctly', () => {
      const leapYearDate = new Date(2024, 1, 29) // Feb 29, 2024
      expect(() => formatDate(leapYearDate.toISOString())).not.toThrow()
    })

    it('should handle edge case of exactly 1 hour ago', () => {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const result = formatDate(oneHourAgo.toISOString())
      // Should be formatted as time, not as "60 min ago"
      expect(result).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/)
    })

    it('should handle future dates gracefully', () => {
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      expect(() => formatDate(futureDate.toISOString())).not.toThrow()
    })
  })
})
