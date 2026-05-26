import {
  findEventByKey,
  readDelta,
  writeDelta,
} from '@/app/fakeApi/utils/calendar-events-store'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/events/[eventId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const found = findEventByKey(request, eventId)
  if (!found) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }
  return NextResponse.json(found.event)
}

/**
 * PATCH /fakeApi/events/[eventId]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const body = await request.json()

  const found = findEventByKey(request, eventId)
  if (!found) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const updatedEvent: CalendarEvent = {
    ...found.event,
    ...body,
    id: eventId,
    calendar_id: found.calendarId,
    updated_at: new Date().toISOString(),
    sequence: (found.event.sequence ?? 0) + 1,
  }

  const delta = readDelta(request)
  delta.upserts[eventId] = updatedEvent

  const response = NextResponse.json(updatedEvent)
  writeDelta(response, delta, request)
  return response
}

/**
 * DELETE /fakeApi/events/[eventId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params

  const found = findEventByKey(request, eventId)
  if (!found) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const delta = readDelta(request)
  delete delta.upserts[eventId]
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
 * OPTIONS /fakeApi/events/[eventId]
 */
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PATCH', 'DELETE'] },
    { status: 200 }
  )
}
