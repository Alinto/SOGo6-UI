import type {
  CalendarEvent,
  CalendarEventsResponse,
} from '@/features/calendars/calendars-types'
import { NextResponse } from 'next/server'

/**
 * Helper functions to calculate relative dates
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
  // Convert to UTC (Europe/Paris is UTC+1 in winter, UTC+2 in summer)
  // For simplicity, we'll use UTC and let the frontend handle timezone conversion
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
          {
            email: 'jane.smith@example.com',
            name: 'Jane Smith',
            role: 'required',
            status: 'tentative',
            rsvp: true,
          },
          {
            email: 'bob.wilson@example.com',
            name: 'Bob Wilson',
            role: 'optional',
            status: 'needs-action',
            rsvp: true,
          },
        ],
        reminders: [
          { method: 'popup', minutes_before: 15 },
          { method: 'email', minutes_before: 60 },
        ],
        conference_data: {
          type: 'zoom',
          url: 'https://zoom.us/j/123456789',
          conference_id: '123-456-789',
          entry_points: [
            {
              type: 'video',
              uri: 'https://zoom.us/j/123456789',
              label: 'Zoom Meeting',
            },
            {
              type: 'phone',
              uri: 'tel:+33123456789',
              label: '+33 1 23 45 67 89',
            },
          ],
        },
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
        attachments: [
          {
            filename: 'Q3_Report.pdf',
            mime_type: 'application/pdf',
            url: 'https://storage.example.com/docs/Q3_Report.pdf',
            size: 2048576,
          },
          {
            filename: 'Presentation.pptx',
            mime_type:
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            url: 'https://storage.example.com/docs/Presentation.pptx',
            size: 5242880,
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
        attendees: [
          {
            email: 'client@example.com',
            name: 'Client Representative',
            role: 'required',
            status: 'accepted',
            rsvp: true,
          },
        ],
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
          {
            email: 'vp-sales@example.com',
            name: 'Mike VP Sales',
            role: 'required',
            status: 'tentative',
            rsvp: true,
          },
          {
            email: 'vp-marketing@example.com',
            name: 'Lisa VP Marketing',
            role: 'required',
            status: 'accepted',
            rsvp: true,
          },
          {
            email: 'hr-director@example.com',
            name: 'Emma HR Director',
            role: 'optional',
            status: 'accepted',
            rsvp: true,
          },
          {
            email: 'exec-assistant@example.com',
            name: 'Tom Executive Assistant',
            role: 'non-participant',
            status: 'accepted',
            rsvp: false,
          },
        ],
        reminders: [
          { method: 'email', minutes_before: 1440 },
          { method: 'popup', minutes_before: 60 },
          { method: 'notification', minutes_before: 15 },
        ],
        conference_data: {
          type: 'zoom',
          url: 'https://zoom.us/j/987654321?pwd=abc123xyz',
          conference_id: '987-654-321',
          entry_points: [
            {
              type: 'video',
              uri: 'https://zoom.us/j/987654321?pwd=abc123xyz',
              label: 'Join Zoom Meeting',
            },
            {
              type: 'phone',
              uri: 'tel:+33123456789',
              label: 'France: +33 1 23 45 67 89',
            },
            {
              type: 'phone',
              uri: 'tel:+441234567890',
              label: 'UK: +44 123 456 7890',
            },
            {
              type: 'sip',
              uri: 'sip:987654321@zoomcrc.com',
              label: 'SIP Room System',
            },
          ],
        },
        attachments: [
          {
            filename: 'Q3_Performance_Report.pdf',
            mime_type: 'application/pdf',
            url: 'https://storage.example.com/confidential/Q3_Report.pdf',
            size: 3145728,
          },
          {
            filename: 'Q4_Budget_Proposal.xlsx',
            mime_type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            url: 'https://storage.example.com/confidential/Q4_Budget.xlsx',
            size: 1572864,
          },
          {
            filename: 'Strategic_Initiatives.pptx',
            mime_type:
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            url: 'https://storage.example.com/confidential/Strategic_Initiatives.pptx',
            size: 8388608,
          },
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
 * GET /fakeApi/calendars/[calendarId]/events
 * Returns a list of events for a specific calendar
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  // Generate events dynamically on each request to ensure dates are always relative to today
  const eventsData = generateEventsWithDynamicDates()
  const events = eventsData[calendarId] || []

  const response: CalendarEventsResponse = {
    events,
    total_count: events.length,
  }

  return NextResponse.json(response)
}

/**
 * POST /fakeApi/calendars/[calendarId]/events
 * Create a new event in the calendar
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  const body = await request.json()

  const newEvent: CalendarEvent = {
    id: `evt_${Date.now()}`,
    calendar_id: calendarId,
    uid: `evt_${Date.now()}@sogo.example.com`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sequence: 0,
    ...body,
  }

  // Note: In a real implementation, this would be persisted to a database
  // For the demo, we just return the created event
  return NextResponse.json(newEvent, { status: 201 })
}

/**
 * OPTIONS /fakeApi/calendars/[calendarId]/events
 * Returns allowed HTTP methods
 */
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
