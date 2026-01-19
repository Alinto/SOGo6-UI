import { CALENDAR_BREAKPOINTS } from '../calendar-breakpoints'

describe('CALENDAR_BREAKPOINTS', () => {
  it('should have mobile breakpoint at 768px', () => {
    expect(CALENDAR_BREAKPOINTS.mobile).toBe(768)
  })

  it('should have tablet breakpoint at 1024px', () => {
    expect(CALENDAR_BREAKPOINTS.tablet).toBe(1024)
  })

  it('should be read-only (const assertion)', () => {
    // TypeScript will catch mutations at compile time
    expect(Object.isFrozen(CALENDAR_BREAKPOINTS)).toBe(false)
  })
})
