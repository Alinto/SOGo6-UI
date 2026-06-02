import { getEventsForAllCalendars } from '@/app/fakeApi/utils/calendar-events-store'
import type { ApiCalendarEventsResponse } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/events
 * Aggregates events from all calendars within an optional date range.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDateTime = searchParams.get('start_date_time')
  const endDateTime = searchParams.get('end_date_time')

  const events = getEventsForAllCalendars(
    request,
    startDateTime,
    endDateTime
  )

  const body: ApiCalendarEventsResponse = {
    data: { events, total_count: events.length },
    error_code: 'S000000',
    error_msg: 'No Error',
  }

  return NextResponse.json(body)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
