import { getAllEvents } from '@/app/fakeApi/utils/calendar-events-store'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/calendars/events
 * Fetches events from multiple calendars within a date range.
 * Query parameters:
 *   - start_date_time: ISO date-time string
 *   - end_date_time: ISO date-time string
 *  - search: optional string to filter events by title or description
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    console.log('searchParams', searchParams)

    const startDateParam = searchParams.get('start_date_time')
    const endDateParam = searchParams.get('end_date_time')
    const searchParam = searchParams.get('search')

    console.log('startDateParam', startDateParam)
    console.log('endDateParam', endDateParam)
    console.log('searchParam', searchParam)

    const startDate = startDateParam
      ? new Date(startDateParam + 'T00:00:00Z')
      : null
    const endDate = endDateParam ? new Date(endDateParam + 'T23:59:59Z') : null

    if (
      (startDate && isNaN(startDate.getTime())) ||
      (endDate && isNaN(endDate.getTime()))
    ) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO date format (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { error: 'start_date must be before end_date' },
        { status: 400 }
      )
    }

    const eventsInRange: CalendarEvent[] = []

    const calendarEvents = getAllEvents(request)

    for (const [calendarId, events] of Object.entries(calendarEvents)) {
      for (const event of events) {
        if (searchParam) {
          const searchLower = searchParam.toLowerCase()
          const titleMatch = event.title.toLowerCase().includes(searchLower)
          const descriptionMatch = event.description
            ? event.description.toLowerCase().includes(searchLower)
            : false
          if (titleMatch || descriptionMatch) {
            eventsInRange.push(event)
          }
        }
        const eventStart = event.all_day
          ? new Date(event.date_start + 'T00:00:00Z')
          : new Date(event.date_start)
        const eventEnd = event.all_day
          ? new Date(event.date_end + 'T23:59:59Z')
          : new Date(event.date_end)
        if (
          startDate &&
          endDate &&
          startDate <= eventStart &&
          endDate >= eventEnd
        ) {
          eventsInRange.push(event)
        } else if (startDate && !endDate && startDate <= eventEnd) {
          eventsInRange.push(event)
        } else if (!startDate && endDate && endDate >= eventStart) {
          eventsInRange.push(event)
        } else if (!startDate && !endDate) {
          eventsInRange.push(event)
        }
      }
    }
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
 * OPTIONS /fakeApi/calendars/events
 */
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
