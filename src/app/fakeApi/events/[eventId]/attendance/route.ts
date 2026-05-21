import {
  emailFromAuthHeader,
  findEventByKey,
  readDelta,
  writeDelta,
} from '@/app/fakeApi/utils/calendar-events-store'
import type {
  AttendanceStatus,
  CalendarEvent,
  EventAttendee,
} from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES: AttendanceStatus[] = [
  'accepted',
  'declined',
  'tentative',
  'delegated',
]

function mapAttendanceToAttendeeStatus(
  status: AttendanceStatus
): NonNullable<EventAttendee['status']> {
  if (status === 'delegated') return 'tentative'
  return status
}

function ok(event: CalendarEvent) {
  return NextResponse.json({
    data: event,
    error_code: 'S000000',
    error_msg: 'No Error',
  })
}

/**
 * POST /fakeApi/events/[eventId]/attendance
 * Body: { status, recurrence_id? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const body = (await request.json()) as {
    status?: AttendanceStatus
    recurrence_id?: string
  }

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      {
        data: null,
        error_code: 'INVALID_REQUEST',
        error_msg: 'status must be accepted, declined, tentative, or delegated',
      },
      { status: 400 }
    )
  }

  const userEmail = emailFromAuthHeader(request)?.trim().toLowerCase()
  if (!userEmail) {
    return NextResponse.json(
      {
        data: null,
        error_code: 'UNAUTHORIZED',
        error_msg: 'Authorization required',
      },
      { status: 401 }
    )
  }

  const found = findEventByKey(request, eventId)
  if (!found) {
    return NextResponse.json(
      {
        data: null,
        error_code: 'NOT_FOUND',
        error_msg: 'Event not found',
      },
      { status: 404 }
    )
  }

  const attendeeStatus = mapAttendanceToAttendeeStatus(body.status)
  const attendees = found.event.attendees ?? []
  const attendeeIndex = attendees.findIndex(
    (a) => a.email.trim().toLowerCase() === userEmail
  )

  if (attendeeIndex < 0) {
    return NextResponse.json(
      {
        data: null,
        error_code: 'FORBIDDEN',
        error_msg: 'You are not an attendee of this event',
      },
      { status: 403 }
    )
  }

  const updatedAttendees = attendees.map((a, i) =>
    i === attendeeIndex ? { ...a, status: attendeeStatus } : a
  )

  const stableEventId = found.event.id ?? eventId

  const updatedEvent: CalendarEvent = {
    ...found.event,
    attendees: updatedAttendees,
    id: stableEventId,
    calendar_id: found.calendarId,
    updated_at: new Date().toISOString(),
    sequence: (found.event.sequence ?? 0) + 1,
    ...(body.recurrence_id ? { recurrence_id: body.recurrence_id } : {}),
  }

  const delta = readDelta(request)
  delta.upserts[stableEventId] = updatedEvent
  const response = ok(updatedEvent)
  writeDelta(response, delta)
  return response
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST'] }, { status: 200 })
}
