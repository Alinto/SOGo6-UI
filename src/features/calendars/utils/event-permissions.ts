import type {
  Calendar,
  CalendarEvent,
  CalendarShareLevel,
} from '@/features/calendars/calendars-types'
import { isSubscriptionCalendar } from '@/features/calendars/utils/calendar-source-type'
import { isCalendarWritable } from '@/features/calendars/utils/is-calendar-writable'

export interface EventPermissions {
  /** Level granted for the event's classification (public/confidential/private). */
  level: CalendarShareLevel
  /** false when only the date/time may be shown (level `view-date-time`). */
  canViewDetails: boolean
  /** Edit / move / resize (level `modify`). */
  canModify: boolean
  /** Delete (`can_erase_objects`). */
  canDelete: boolean
}

/** Permissions used when the event carries no restriction. */
export const FULL_EVENT_PERMISSIONS: EventPermissions = {
  level: 'modify',
  canViewDetails: true,
  canModify: true,
  canDelete: true,
}

export function findCalendarByRef(
  calendars: Calendar[] | undefined,
  calendarRef: string | null | undefined
): Calendar | undefined {
  const ref = calendarRef?.trim()
  if (!calendars?.length || !ref) return undefined
  return calendars.find((cal) => cal.key === ref || cal.id === ref)
}

/**
 * Compute what the connected user may do with an event.
 *
 * Source of truth is the event's own `rights` (GET /events/{event_key}), then
 * the calendar's `rights`. Without any rights (legacy backend), the calendar
 * being writable grants everything and read-only calendars still allow
 * viewing. Subscription calendars are never modifiable.
 */
export function getEventPermissions(
  event: Pick<CalendarEvent, 'rights' | 'visibility'>,
  calendar: Calendar | undefined
): EventPermissions {
  const rights = event.rights ?? calendar?.rights

  if (!rights) {
    const writable = isCalendarWritable(calendar)
    return {
      level: writable ? 'modify' : 'view-all',
      canViewDetails: true,
      canModify: writable,
      canDelete: writable,
    }
  }

  const level = rights[event.visibility ?? 'public']
  const readOnlyCalendar = calendar ? isSubscriptionCalendar(calendar) : false

  return {
    level,
    canViewDetails: level === 'view-all' || level === 'modify',
    canModify: !readOnlyCalendar && level === 'modify',
    canDelete: !readOnlyCalendar && rights.can_erase_objects,
  }
}
