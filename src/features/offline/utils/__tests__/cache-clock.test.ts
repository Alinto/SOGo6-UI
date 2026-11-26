import { folderLabelFromPath, formatCacheClock } from '../cache-clock'

describe('folderLabelFromPath', () => {
  it('uses the last path segment', () => {
    expect(folderLabelFromPath('INBOX')).toBe('INBOX')
    expect(folderLabelFromPath('INBOX/Work')).toBe('Work')
  })
})

describe('formatCacheClock', () => {
  it('formats hours and minutes', () => {
    const ms = Date.UTC(2026, 7, 26, 12, 32, 0)
    expect(formatCacheClock(ms, 'en-GB', ms)).toMatch(/^\d{2}:\d{2}$/)
  })

  it('adds the date when the data is not from today', () => {
    const ms = Date.UTC(2026, 7, 26, 12, 32, 0)
    const label = formatCacheClock(ms, 'en-GB', ms + 3 * 24 * 60 * 60 * 1000)
    expect(label).toMatch(/Aug/)
    expect(label).toMatch(/\d{2}:\d{2}/)
    expect(label).not.toMatch(/2026/)
  })

  it('adds the year when the data is from another year', () => {
    const ms = Date.UTC(2025, 11, 20, 12, 0, 0)
    const label = formatCacheClock(ms, 'en-GB', Date.UTC(2026, 0, 5, 12, 0, 0))
    expect(label).toMatch(/2025/)
  })
})
