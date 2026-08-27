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
    expect(formatCacheClock(ms, 'en-GB')).toMatch(/\d{2}:\d{2}/)
  })
})
