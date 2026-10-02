import type { Calendar } from '@/features/calendars/calendars-types'

/** Default calendar when flagged, otherwise the first one returned. */
export function pickPreferredCalendar(
  calendars: Calendar[]
): Calendar | undefined {
  return calendars.find((calendar) => calendar.is_default) ?? calendars[0]
}
