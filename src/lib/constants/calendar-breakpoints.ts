export const CALENDAR_BREAKPOINTS = {
  /** Mobile devices: ≤768px */
  mobile: 768,
  /** Tablet devices: ≤1024px */
  tablet: 1024,
} as const

export type CalendarBreakpoint = keyof typeof CALENDAR_BREAKPOINTS
