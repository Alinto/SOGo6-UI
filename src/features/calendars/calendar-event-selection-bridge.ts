import type { CalendarEvent } from '@/features/calendars/calendars-types'

type CalendarEventSelectionHandler = (event: CalendarEvent) => void

let selectionHandler: CalendarEventSelectionHandler | null = null

/** Register handler while the calendar page is mounted (e.g. open event dialog). */
export function registerCalendarEventSelection(
  handler: CalendarEventSelectionHandler
): () => void {
  selectionHandler = handler
  return () => {
    if (selectionHandler === handler) {
      selectionHandler = null
    }
  }
}

/** Called from header search when the user picks a result. */
export function selectCalendarEventFromSearch(event: CalendarEvent): void {
  selectionHandler?.(event)
}
