import {
  getEventsForCalendar,
  readDelta,
  writeDelta,
} from '@/app/fakeApi/utils/calendar-events-store'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/calendars/[calendarId]/events/[eventId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string; eventId: string }> }
) {
  const { calendarId, eventId } = await params
  const events = getEventsForCalendar(request, calendarId)
  const event = events.find((e) => e.id === eventId)

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  return NextResponse.json(event)
}

/**
 * PATCH /fakeApi/calendars/[calendarId]/events/[eventId]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string; eventId: string }> }
) {
  const { calendarId, eventId } = await params
  const body = await request.json()

  const events = getEventsForCalendar(request, calendarId)
  const existing = events.find((e) => e.id === eventId)

  if (!existing) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const updatedEvent: CalendarEvent = {
    ...existing,
    ...body,
    id: eventId,
    calendar_id: calendarId,
    updated_at: new Date().toISOString(),
    sequence: (existing.sequence ?? 0) + 1,
  }

  const delta = readDelta(request)
  delta.upserts[eventId] = updatedEvent

  const response = NextResponse.json(updatedEvent)
  writeDelta(response, delta, request)
  return response
}

/**
 * DELETE /fakeApi/calendars/[calendarId]/events/[eventId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string; eventId: string }> }
) {
  const { calendarId, eventId } = await params

  const events = getEventsForCalendar(request, calendarId)
  const exists = events.some((e) => e.id === eventId)

  if (!exists) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const delta = readDelta(request)

  // Remove from upserts if it was a user-created event
  delete delta.upserts[eventId]

  // Mark as deleted (covers seed events + re-created events)
  if (!delta.deletedIds.includes(eventId)) {
    delta.deletedIds.push(eventId)
  }

  const response = NextResponse.json(
    { success: true, deleted_id: eventId },
    { status: 200 }
  )
  writeDelta(response, delta, request)
  return response
}

/**
 * OPTIONS /fakeApi/calendars/[calendarId]/events/[eventId]
 */
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PATCH', 'DELETE'] },
    { status: 200 }
  )
}
