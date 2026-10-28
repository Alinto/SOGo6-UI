import type {
  Calendar,
  CalendarFolderScope,
} from '@/features/calendars/calendars-types'

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

/**
 * Shared = owned by someone else than the connected account; without an owner,
 * fall back to the backend source type.
 */
export function isSharedWithMe(
  calendar: Pick<Calendar, 'source_type' | 'owner'>,
  isOtherOwner: (owner?: string | null) => boolean
): boolean {
  return calendar.owner
    ? isOtherOwner(calendar.owner)
    : isSharedCalendar(calendar)
}

/**
 * Bucket of /preferences/folders holding the calendar: OWNER for personal
 * calendars, SUBS for shared calendars and subscriptions.
 */
export function getCalendarFolderScope(
  calendar: Pick<Calendar, 'source_type' | 'owner'>,
  isOtherOwner: (owner?: string | null) => boolean
): CalendarFolderScope {
  return isSubscriptionCalendar(calendar) ||
    isSharedWithMe(calendar, isOtherOwner)
    ? 'SUBS'
    : 'OWNER'
}
