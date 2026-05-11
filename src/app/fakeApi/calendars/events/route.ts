import { getEventsForCalendar } from '@/app/fakeApi/utils/calendar-events-store'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/calendars/events/range
 * Fetches events from multiple calendars within a date range.
 * Query parameters:
 *   - calendar_ids: comma-separated list of calendar IDs
 *   - start_date: ISO date string (YYYY-MM-DD)
 *   - end_date: ISO date string (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const calendarIdsParam = searchParams.get('calendar_ids')
    const startDateParam = searchParams.get('start_date')
    const endDateParam = searchParams.get('end_date')

    if (!calendarIdsParam || !startDateParam || !endDateParam) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters: calendar_ids, start_date, end_date',
        },
        { status: 400 }
      )
    }

    const calendarIds = calendarIdsParam.split(',').map((id) => id.trim())
    const startDate = new Date(startDateParam + 'T00:00:00Z')
    const endDate = new Date(endDateParam + 'T23:59:59Z')

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO date format (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'start_date must be before end_date' },
        { status: 400 }
      )
    }

    const eventsInRange: CalendarEvent[] = []

    for (const calendarId of calendarIds) {
      const calendarEvents = getEventsForCalendar(request, calendarId)
      const filtered = calendarEvents.filter((event) => {
        const eventStart = new Date(event.start_date ?? event.date_start ?? '')
        const eventEnd = new Date(event.end_date ?? event.date_end ?? '')
        return eventStart <= endDate && eventEnd >= startDate
      })
      eventsInRange.push(...filtered)
    }

    eventsInRange.sort(
      (a, b) =>
        new Date(a.start_date ?? a.date_start ?? '').getTime() -
        new Date(b.start_date ?? b.date_start ?? '').getTime()
    )

    return NextResponse.json(eventsInRange)
  } catch (error) {
    console.error('Error fetching events in range:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /fakeApi/calendars/events/range
 */
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
