import type { Calendar } from '@/features/calendars/calendars-types'
import { isSubscriptionCalendar } from '@/features/calendars/utils/calendar-source-type'

export function isCalendarWritable(calendar: Calendar | undefined): boolean {
  if (!calendar) return false
  return !isSubscriptionCalendar(calendar)
}
