import { formatMailPrintDate } from '../format-mail-print-date'

describe('formatMailPrintDate', () => {
  describe('configuration', () => {
    it('formats a numeric timestamp', () => {
      const result = formatMailPrintDate(1_704_067_200_000)
      expect(result).toMatch(/\d{4}/)
      expect(result.length).toBeGreaterThan(5)
    })

    it('formats an ISO date string', () => {
      const result = formatMailPrintDate('2024-01-15T10:30:00.000Z')
      expect(result).toMatch(/2024/)
    })
  })

  describe('component stability', () => {
    it('returns the original value as string when date is invalid', () => {
      expect(formatMailPrintDate('not-a-date')).toBe('not-a-date')
    })
  })
})
