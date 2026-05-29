import type { Calendar } from '@/features/calendars/calendars-types'

type CalendarWithSource = Pick<Calendar, 'source_type'>

/** Personal / local calendars (real backend uses `local`). */
export function isPersonalCalendar(calendar: CalendarWithSource): boolean {
  const type = calendar.source_type
  if (type === 'shared') return false
  if (type === 'subscription' || type === 'ics') return false
  return (
    type === 'personal' ||
    type === 'local' ||
    type === 'caldav' ||
    type === undefined
  )
}

export function isSharedCalendar(calendar: CalendarWithSource): boolean {
  return calendar.source_type === 'shared'
}

export function isSubscriptionCalendar(calendar: CalendarWithSource): boolean {
  const type = calendar.source_type
  return type === 'subscription' || type === 'ics'
}
