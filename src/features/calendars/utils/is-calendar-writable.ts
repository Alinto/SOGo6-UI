import type { Calendar } from '@/features/calendars/calendars-types'
import { isSubscriptionCalendar } from '@/features/calendars/utils/calendar-source-type'

/**
 * Whether events can be created in this calendar. Subscription calendars are
 * always read-only; otherwise the backend `rights.can_create_objects` decides
 * (calendars returned without `rights` stay writable).
 */
export function isCalendarWritable(calendar: Calendar | undefined): boolean {
  if (!calendar) return false
  if (isSubscriptionCalendar(calendar)) return false
  return calendar.rights ? calendar.rights.can_create_objects : true
}
