import {
  getEventsForCalendar,
  readDelta,
  writeDelta,
} from '@/app/fakeApi/utils/calendar-events-store'
import type {
  ApiCalendarEventsResponse,
  CalendarEvent,
} from '@/features/calendars/calendars-types'
import { textMatchesSearch } from '@/lib/utils/strip-accents'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/calendars/[calendarId]/events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  const { searchParams } = new URL(request.url)
  const startDateTime =
    searchParams.get('start_date_time') ?? searchParams.get('start_date')
  const endDateTime =
    searchParams.get('end_date_time') ?? searchParams.get('end_date')
  const search = searchParams.get('search')?.trim()

  let events = getEventsForCalendar(request, calendarId)

  if (startDateTime) {
    const startBoundary = new Date(startDateTime).getTime()
    events = events.filter(
      (e) =>
        new Date( e.date_end ?? '').getTime() >= startBoundary
    )
  }
  if (endDateTime) {
    const endBoundary = new Date(endDateTime).getTime()
    events = events.filter(
      (e) =>
        new Date( e.date_start ?? '').getTime() <= endBoundary
    )
  }
  if (search && search.length >= 2) {
    events = events.filter((e) =>
      [e.title, e.description, e.location].some((v) =>
        v ? textMatchesSearch(v, search) : false
      )
    )
  }

  const body: ApiCalendarEventsResponse = {
    data: { events, total_count: events.length },
    error_code: 'S000000',
    error_msg: 'No Error',
  }

  return NextResponse.json(body)
}

/**
 * POST /fakeApi/calendars/[calendarId]/events
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  const body = await request.json()

  const delta = readDelta(request)

  const existingEvents = getEventsForCalendar(request, calendarId)
  const existingIds = existingEvents.map((e) => e.id ?? '')

  let id = body.id
  if (!id) {
    do {
      id = `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
    } while (existingIds.includes(id))
  } else if (existingIds.includes(id)) {
    return NextResponse.json(
      { error: 'Event with this ID already exists' },
      { status: 409 }
    )
  }

  const now = new Date().toISOString()
  const newEvent: CalendarEvent = {
    uid: `${id}@sogo.example.com`,
    sequence: 0,
    ...body,
    id,
    calendar_id: calendarId,
    created_at: now,
    updated_at: now,
  }

  delta.upserts[id] = newEvent

  const response = NextResponse.json(newEvent, { status: 201 })
  writeDelta(response, delta, request)
  return response
}

/**
 * OPTIONS /fakeApi/calendars/[calendarId]/events
 */
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
