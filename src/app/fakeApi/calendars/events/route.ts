import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

// Sample events data - same as in [calendarId]/events/route.ts
// This is a temporary solution until we extract shared data
const allEventsData: Record<string, CalendarEvent[]> = {
  'personal-cal-1': [
    {
      id: 'evt_001',
      calendar_id: 'personal-cal-1',
      uid: 'evt_001@sogo.example.com',
      title: 'Team Standup',
      description: 'Daily team sync meeting',
      location: 'Conference Room A',
      start_date: '2025-10-28T09:00:00Z',
      end_date: '2025-10-28T09:30:00Z',
      all_day: false,
      timezone: 'Europe/Paris',
      status: 'confirmed',
      visibility: 'public',
      show_as: 'busy',
      organizer: {
        email: 'manager@example.com',
        name: 'Sarah Manager',
        role: 'chair',
        status: 'accepted',
      },
      attendees: [
        {
          email: 'john.doe@example.com',
          name: 'John Doe',
          role: 'required',
          status: 'accepted',
          rsvp: true,
        },
      ],
      reminders: [
        { method: 'popup', minutes_before: 15 },
        { method: 'email', minutes_before: 60 },
      ],
      created_at: '2025-10-20T10:00:00Z',
      updated_at: '2025-10-25T14:30:00Z',
      sequence: 2,
    },
    {
      id: 'evt_010',
      calendar_id: 'personal-cal-1',
      uid: 'evt_010@sogo.example.com',
      title: 'Company Annual Conference',
      description: 'Annual company-wide conference in Paris',
      location: 'Paris Convention Center',
      start_date: '2025-11-15T00:00:00Z',
      end_date: '2025-11-17T00:00:00Z',
      all_day: true,
      timezone: 'Europe/Paris',
      status: 'confirmed',
      visibility: 'public',
      show_as: 'busy',
      organizer: {
        email: 'admin@example.com',
        name: 'Admin',
        role: 'chair',
        status: 'accepted',
      },
      reminders: [{ method: 'email', minutes_before: 1440 }],
      created_at: '2025-10-10T08:00:00Z',
      updated_at: '2025-10-10T08:00:00Z',
      sequence: 0,
    },
    {
      id: 'evt_002',
      calendar_id: 'personal-cal-1',
      uid: 'evt_002@sogo.example.com',
      title: 'Company Annual Conference',
      description: 'Annual company-wide conference in Paris',
      location: 'Paris Convention Center',
      start_date: '2025-11-15T00:00:00Z',
      end_date: '2025-11-17T00:00:00Z',
      all_day: true,
      timezone: 'Europe/Paris',
      status: 'confirmed',
      visibility: 'public',
      show_as: 'busy',
      organizer: {
        email: 'admin@example.com',
        name: 'Admin',
        role: 'chair',
        status: 'accepted',
      },
      reminders: [{ method: 'email', minutes_before: 1440 }],
      created_at: '2025-10-10T08:00:00Z',
      updated_at: '2025-10-10T08:00:00Z',
      sequence: 0,
    },
    {
      id: 'evt_004',
      calendar_id: 'personal-cal-1',
      uid: 'evt_004@sogo.example.com',
      title: 'Doctor Appointment',
      description: 'Annual checkup',
      location: 'Medical Center',
      start_date: '2025-10-30T10:00:00Z',
      end_date: '2025-10-30T11:00:00Z',
      all_day: false,
      timezone: 'Europe/Paris',
      status: 'confirmed',
      visibility: 'private',
      show_as: 'busy',
      reminders: [
        { method: 'popup', minutes_before: 60 },
        { method: 'email', minutes_before: 1440 },
      ],
      created_at: '2025-10-15T09:00:00Z',
      updated_at: '2025-10-15T09:00:00Z',
      sequence: 0,
    },
  ],
  'shared-cal-1': [
    {
      id: 'evt_100',
      calendar_id: 'shared-cal-1',
      uid: 'evt_100@sogo.example.com',
      title: 'Team Project Planning',
      description: 'Planning for Q4 project',
      location: 'Conference Room C',
      start_date: '2025-10-29T10:00:00Z',
      end_date: '2025-10-29T11:30:00Z',
      all_day: false,
      timezone: 'Europe/Paris',
      status: 'confirmed',
      visibility: 'public',
      show_as: 'busy',
      organizer: {
        email: 'team-lead@example.com',
        name: 'Team Lead',
        role: 'chair',
        status: 'accepted',
      },
      attendees: [
        {
          email: 'dev1@example.com',
          name: 'Developer 1',
          role: 'required',
          status: 'accepted',
        },
        {
          email: 'dev2@example.com',
          name: 'Developer 2',
          role: 'required',
          status: 'accepted',
        },
      ],
      reminders: [{ method: 'popup', minutes_before: 15 }],
      created_at: '2025-10-22T14:00:00Z',
      updated_at: '2025-10-22T14:00:00Z',
      sequence: 0,
    },
    {
      id: 'evt_101',
      calendar_id: 'shared-cal-1',
      uid: 'evt_101@sogo.example.com',
      title: 'Sprint Review',
      description: 'End of sprint review and retrospective',
      location: 'Video Call',
      start_date: '2025-11-07T14:00:00Z',
      end_date: '2025-11-07T15:00:00Z',
      all_day: false,
      timezone: 'Europe/Paris',
      status: 'confirmed',
      visibility: 'public',
      show_as: 'busy',
      reminders: [{ method: 'popup', minutes_before: 30 }],
      created_at: '2025-10-23T09:00:00Z',
      updated_at: '2025-10-23T09:00:00Z',
      sequence: 0,
    },
  ],
}

/**
 * GET /fakeApi/calendars/events/range
 * Fetches events from multiple calendars within a specified date range
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

    // Validate required parameters
    if (!calendarIdsParam || !startDateParam || !endDateParam) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters: calendar_ids, start_date, end_date',
        },
        { status: 400 }
      )
    }

    // Parse calendar IDs
    const calendarIds = calendarIdsParam.split(',').map((id) => id.trim())

    // Parse dates
    const startDate = new Date(startDateParam + 'T00:00:00Z')
    const endDate = new Date(endDateParam + 'T23:59:59Z')

    // Validate dates
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

    // Collect events from all calendars within the date range
    const eventsInRange: CalendarEvent[] = []

    for (const calendarId of calendarIds) {
      const calendarEvents = allEventsData[calendarId] || []

      // Filter events that fall within the date range
      const filteredEvents = calendarEvents.filter((event: CalendarEvent) => {
        const eventStart = new Date(event.start_date)
        const eventEnd = new Date(event.end_date)

        // Event overlaps with range if it starts before range ends and ends after range starts
        return eventStart <= endDate && eventEnd >= startDate
      })

      eventsInRange.push(...filteredEvents)
    }

    // Sort events by start date
    eventsInRange.sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
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
 * Returns allowed HTTP methods
 */
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
