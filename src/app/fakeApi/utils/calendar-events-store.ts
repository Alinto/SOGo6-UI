import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'
import { generateDefaultCalendarEvents } from './calendar-events-seed'
import { getDemoData, setDemoData } from './demo-storage'

const COOKIE_NAME = 'demo_cal_delta'

/**
 * Delta stored in cookie — only user mutations, not the seed events.
 * Kept small to stay within the 4KB browser cookie limit.
 */
interface CalendarDelta {
  /** Events created or updated by the user, keyed by id */
  upserts: Record<string, CalendarEvent>
  /** IDs of seed events deleted by the user */
  deletedIds: string[]
}

const EMPTY_DELTA: CalendarDelta = { upserts: {}, deletedIds: [] }

export function readDelta(req: NextRequest): CalendarDelta {
  return getDemoData<CalendarDelta>(req, COOKIE_NAME, EMPTY_DELTA)
}

export function writeDelta(res: NextResponse, delta: CalendarDelta): void {
  setDemoData(res, COOKIE_NAME, delta)
}

/**
 * Merge seed events with user delta for a given calendar.
 * - Deleted seed events are excluded.
 * - Upserted events overwrite or append.
 */
export function getEventsForCalendar(
  req: NextRequest,
  calendarId: string
): CalendarEvent[] {
  const seeds = generateDefaultCalendarEvents()
  const delta = readDelta(req)

  const base = (seeds[calendarId] ?? []).filter(
    (e) => !delta.deletedIds.includes(e.id ?? '')
  )

  const upsertedIds = new Set(
    Object.values(delta.upserts)
      .filter((e) => e.calendar_id === calendarId)
      .map((e) => e.id ?? '')
  )

  const merged = base
    .map((e) =>
      upsertedIds.has(e.id ?? '') ? delta.upserts[e.id ?? ''] : e
    )
    .concat(
      Object.values(delta.upserts).filter(
        (e) => e.calendar_id === calendarId && !base.some((b) => b.id === e.id)
      )
    )

  return merged
}

/**
 * All events across all known calendars, merged with delta.
 */
export function getAllEvents(req: NextRequest): Record<string, CalendarEvent[]> {
  const seeds = generateDefaultCalendarEvents()
  return Object.fromEntries(
    Object.keys(seeds).map((calId) => [calId, getEventsForCalendar(req, calId)])
  )
}
