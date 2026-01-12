import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Helper functions to calculate relative dates
 * (Same as in [calendarId]/events/route.ts - should be extracted to a shared utility)
 */
function getToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function getTomorrow(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

function getDaysFromToday(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(0, 0, 0, 0)
  return date
}

function getNextWeekday(dayOfWeek: number): Date {
  // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const today = new Date()
  const currentDay = today.getDay()
  let daysToAdd = dayOfWeek - currentDay
  if (daysToAdd <= 0) {
    daysToAdd += 7 // Next week
  }
  const nextDay = new Date(today)
  nextDay.setDate(today.getDate() + daysToAdd)
  nextDay.setHours(0, 0, 0, 0)
  return nextDay
}

function getNextFriday(): Date {
  return getNextWeekday(5) // Friday = 5
}

function getNextMonday(): Date {
  return getNextWeekday(1) // Monday = 1
}

function formatDateWithTime(
  date: Date,
  hours: number,
  minutes: number = 0
): string {
  const dateWithTime = new Date(date)
  dateWithTime.setHours(hours, minutes, 0, 0)
  return dateWithTime.toISOString()
}

function formatDateAllDay(date: Date): string {
  const allDayDate = new Date(date)
  allDayDate.setHours(0, 0, 0, 0)
  return allDayDate.toISOString()
}

/**
 * Generate calendar events with dynamic dates relative to today
 */
function generateEventsWithDynamicDates(): Record<string, CalendarEvent[]> {
  const today = getToday()
  const tomorrow = getTomorrow()
  const inTwoDays = getDaysFromToday(2)
  const nextMonday = getNextMonday()
  const nextFriday = getNextFriday()
  const inOneWeek = getDaysFromToday(7)
  const yesterday = getDaysFromToday(-1)

  return {
    'personal-cal-1': [
      {
        id: 'evt_001',
        calendar_id: 'personal-cal-1',
        uid: 'evt_001@sogo.example.com',
        title: 'Team Standup',
        description: 'Daily team sync meeting',
        location: 'Conference Room A',
        start_date: formatDateWithTime(today, 9, 30),
        end_date: formatDateWithTime(today, 10, 0),
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
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sequence: 2,
      },

      {
        id: 'evt_004',
        calendar_id: 'personal-cal-1',
        uid: 'evt_004@sogo.example.com',
        title: 'Doctor Appointment',
        description: 'Annual checkup',
        location: 'Medical Center',
        start_date: formatDateWithTime(tomorrow, 10, 0),
        end_date: formatDateWithTime(tomorrow, 11, 0),
        all_day: false,
        timezone: 'Europe/Paris',
        status: 'confirmed',
        visibility: 'private',
        show_as: 'busy',
        reminders: [
          { method: 'popup', minutes_before: 60 },
          { method: 'email', minutes_before: 1440 },
        ],
        created_at: new Date(
          Date.now() - 12 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 12 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sequence: 0,
      },

      {
        id: 'evt_005',
        calendar_id: 'personal-cal-1',
        uid: 'evt_005@sogo.example.com',
        title: 'Project Review',
        description: 'Quarterly project review and planning',
        location: 'Conference Room B',
        start_date: formatDateWithTime(inTwoDays, 15, 0),
        end_date: formatDateWithTime(inTwoDays, 17, 0),
        all_day: false,
        timezone: 'Europe/Paris',
        status: 'confirmed',
        visibility: 'public',
        show_as: 'busy',
        color: '#4285f4',
        organizer: {
          email: 'project-manager@example.com',
          name: 'Project Manager',
          role: 'chair',
          status: 'accepted',
        },
        attendees: [
          {
            email: 'stakeholder1@example.com',
            name: 'Stakeholder One',
            role: 'required',
            status: 'accepted',
          },
          {
            email: 'stakeholder2@example.com',
            name: 'Stakeholder Two',
            role: 'required',
            status: 'needs-action',
          },
        ],
        reminders: [{ method: 'popup', minutes_before: 30 }],
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sequence: 1,
      },

      {
        id: 'evt_006',
        calendar_id: 'personal-cal-1',
        uid: 'evt_006@sogo.example.com',
        title: 'Client Meeting',
        description: 'Important meeting with key client',
        location: 'Client Office',
        start_date: formatDateWithTime(nextFriday, 14, 0),
        end_date: formatDateWithTime(nextFriday, 15, 30),
        all_day: false,
        timezone: 'Europe/Paris',
        status: 'confirmed',
        visibility: 'public',
        show_as: 'busy',
        organizer: {
          email: 'sales@example.com',
          name: 'Sales Team',
          role: 'chair',
          status: 'accepted',
        },
        reminders: [
          { method: 'email', minutes_before: 1440 },
          { method: 'popup', minutes_before: 30 },
        ],
        created_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sequence: 0,
      },

      {
        id: 'evt_002',
        calendar_id: 'personal-cal-1',
        uid: 'evt_002@sogo.example.com',
        title: 'Company Annual Conference',
        description: 'Annual company-wide conference in Paris',
        location: 'Paris Convention Center',
        start_date: formatDateAllDay(inOneWeek),
        end_date: formatDateAllDay(getDaysFromToday(9)), // 3 days event
        all_day: true,
        timezone: 'Europe/Paris',
        status: 'confirmed',
        visibility: 'public',
        show_as: 'out-of-office',
        organizer: {
          email: 'hr@example.com',
          name: 'HR Department',
          role: 'chair',
        },
        reminders: [
          { method: 'email', minutes_before: 1440 },
          { method: 'popup', minutes_before: 10080 },
        ],
        created_at: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sequence: 0,
      },

      {
        id: 'evt_007',
        calendar_id: 'personal-cal-1',
        uid: 'evt_007@sogo.example.com',
        title: 'Team Retrospective',
        description: 'Sprint retrospective and lessons learned',
        location: 'Conference Room A',
        start_date: formatDateWithTime(yesterday, 15, 0),
        end_date: formatDateWithTime(yesterday, 16, 30),
        all_day: false,
        timezone: 'Europe/Paris',
        status: 'confirmed',
        visibility: 'public',
        show_as: 'busy',
        organizer: {
          email: 'scrum-master@example.com',
          name: 'Scrum Master',
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
        created_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sequence: 0,
      },
    ],

    'shared-cal-1': [
      {
        id: 'evt_003',
        calendar_id: 'shared-cal-1',
        uid: 'evt_003@sogo.example.com',
        title: 'Weekly Planning Meeting',
        description: 'Review progress and plan for the week',
        location: 'Virtual - Teams',
        start_date: formatDateWithTime(nextMonday, 9, 0),
        end_date: formatDateWithTime(nextMonday, 10, 0),
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
            email: 'member1@example.com',
            name: 'Member One',
            role: 'required',
            status: 'accepted',
          },
          {
            email: 'member2@example.com',
            name: 'Member Two',
            role: 'required',
            status: 'accepted',
          },
        ],
        recurrence: {
          frequency: 'weekly',
          interval: 1,
          by_day: ['MO'],
          count: 52,
        },
        reminders: [{ method: 'popup', minutes_before: 10 }],
        conference_data: {
          type: 'teams',
          url: 'https://teams.microsoft.com/l/meetup-join/...',
          conference_id: 'teams_meeting_001',
        },
        created_at: new Date(
          Date.now() - 180 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 180 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sequence: 0,
      },

      {
        id: 'evt_detailed_001',
        calendar_id: 'shared-cal-1',
        uid: 'evt_detailed_001@sogo.example.com',
        title: 'Q4 Strategic Planning Session',
        description: `Quarterly strategic planning session to review:
- Q3 performance metrics
- Q4 objectives and key results
- Budget allocation for next quarter
- Team resource planning

Please review the attached documents before the meeting.`,
        location: 'Headquarters - Board Room, 5th Floor',
        start_date: formatDateWithTime(getDaysFromToday(5), 9, 0),
        end_date: formatDateWithTime(getDaysFromToday(5), 12, 0),
        all_day: false,
        timezone: 'Europe/Paris',
        status: 'confirmed',
        visibility: 'confidential',
        show_as: 'busy',
        transparency: 'opaque',
        organizer: {
          email: 'ceo@example.com',
          name: 'Jane CEO',
          role: 'chair',
          status: 'accepted',
          rsvp: false,
        },
        attendees: [
          {
            email: 'cfo@example.com',
            name: 'John CFO',
            role: 'required',
            status: 'accepted',
            rsvp: true,
          },
          {
            email: 'cto@example.com',
            name: 'Sarah CTO',
            role: 'required',
            status: 'accepted',
            rsvp: true,
          },
        ],
        reminders: [
          { method: 'email', minutes_before: 1440 },
          { method: 'popup', minutes_before: 60 },
        ],
        color: '#d50000',
        locked: true,
        created_at: new Date(
          Date.now() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        sequence: 3,
      },
    ],

    'personal-cal-2': [],
    'personal-cal-3': [],
    'shared-cal-2': [],
    'sub-cal-1': [],
  }
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

    // Generate events dynamically on each request to ensure dates are always relative to today
    const allEventsData = generateEventsWithDynamicDates()

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
