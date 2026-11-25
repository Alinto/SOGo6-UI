import type { CalendarEvent } from '@/features/calendars/calendars-types'

/** Prefer first non-empty string; avoids losing list calendar when GET detail omits it. */
export function pickNonEmptyCalendarRef(
  ...values: (string | null | undefined)[]
): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim().length > 0) {
      return v.trim()
    }
  }
  return ''
}

/** Merge API detail onto grid event so calendar_id from the list is kept when detail has null/empty. */
export function mergeEventDetailWithListSelection(
  listEvent: CalendarEvent,
  detail: CalendarEvent | undefined
): CalendarEvent {
  if (!detail) return listEvent
  const calendarRef = pickNonEmptyCalendarRef(
    listEvent.calendar_id,
    listEvent.calendar_key,
    detail.calendar_id,
    detail.calendar_key
  )
  const merged: CalendarEvent = {
    ...listEvent,
    ...detail,
    calendar_id:
      calendarRef || (listEvent.calendar_id ?? detail.calendar_id ?? null),
    calendar_key: calendarRef || listEvent.calendar_key || detail.calendar_key,
  }
  // An expanded occurrence is fetched with its master key: the detail is the
  // master. Keep the clicked occurrence identity (recurrence_id and bounds),
  // or edits and replies scoped to "this occurrence" hit the whole series.
  if (listEvent.recurrence_id && !detail.recurrence_id) {
    return {
      ...merged,
      recurrence_id: listEvent.recurrence_id,
      date_start: listEvent.date_start,
      date_end: listEvent.date_end,
      series_date_start: detail.date_start ?? null,
      series_date_end: detail.date_end ?? null,
    }
  }
  return merged
}
