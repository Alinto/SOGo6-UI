import type {
  CalendarEvent,
  CalendarEventUpdateBody,
} from '@/features/calendars/calendars-types'
import type { RecurrenceScope } from '@/features/calendars/components/recurrence-scope-dialog'

export type RecurringDeletePlan =
  | { kind: 'delete'; eventKey: string }
  | { kind: 'patch'; eventKey: string; body: CalendarEventUpdateBody }

const sameInstant = (a?: string | null, b?: string | null) =>
  Boolean(a && b) &&
  new Date(a as string).getTime() === new Date(b as string).getTime()

/**
 * How to delete (part of) a recurring event. The DELETE route ignores any
 * scope and drops the whole series (with a CANCEL to every attendee) unless
 * the key is a detached occurrence, so partial scopes go through the master:
 * - ONE: add the occurrence to the master EXDATE list;
 * - THISANDFUTURE: PATCH with recurrence_id + range and no other change,
 *   which the server treats as a plain truncation of the series.
 * Returns null when the master EXDATE list is not known yet (sending a
 * partial list would bring back previously deleted occurrences).
 */
export function planRecurringDelete(
  event: CalendarEvent,
  scope: RecurrenceScope
): RecurringDeletePlan | null {
  const eventKey = event.key ?? event.id ?? event.uid
  if (!eventKey) return null

  const recurrenceId = event.recurrence_id
  const rule = event.recurrence_rule ?? event.recurrence
  // A detached occurrence has its own key and no rule: the server deletes it
  // alone and adds its slot to the master EXDATE.
  if (scope === 'ALL' || !recurrenceId || !rule) {
    return { kind: 'delete', eventKey }
  }

  if (scope === 'THISANDFUTURE') {
    const seriesStart = event.series_date_start
    if (sameInstant(recurrenceId, seriesStart)) {
      return { kind: 'delete', eventKey }
    }
    return {
      kind: 'patch',
      eventKey,
      body: { recurrence_id: recurrenceId, recurrence_range: 'THISANDFUTURE' },
    }
  }

  if (!event.recurrence_exceptions) return null
  const exceptions = event.recurrence_exceptions.some((d) =>
    sameInstant(d, recurrenceId)
  )
    ? event.recurrence_exceptions
    : [...event.recurrence_exceptions, recurrenceId]
  return {
    kind: 'patch',
    eventKey,
    body: { recurrence_exceptions: exceptions },
  }
}
