import type {
  CalendarEvent,
  CalendarEventsResponse,
} from '@/features/calendars/calendars-types'
import { NextResponse } from 'next/server'

// Sample calendar events data
const eventsData: Record<string, CalendarEvent[]> = {
  'personal-cal-1': [
    // Regular meeting
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
      created_at: '2025-10-20T10:00:00Z',
      updated_at: '2025-10-25T14:30:00Z',
      sequence: 2,
    },

    // Private event
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

    // Event with attachments
    {
      id: 'evt_005',
      calendar_id: 'personal-cal-1',
      uid: 'evt_005@sogo.example.com',
      title: 'Project Review',
      description: 'Quarterly project review and planning',
      location: 'Conference Room B',
      start_date: '2025-11-01T15:00:00Z',
      end_date: '2025-11-01T17:00:00Z',
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
      created_at: '2025-10-20T11:00:00Z',
      updated_at: '2025-10-22T16:30:00Z',
      sequence: 1,
    },

    // Tentative event
    {
      id: 'evt_006',
      calendar_id: 'personal-cal-1',
      uid: 'evt_006@sogo.example.com',
      title: 'Client Meeting (Tentative)',
      description: 'Potential meeting with new client',
      location: 'TBD',
      start_date: '2025-11-05T13:00:00Z',
      end_date: '2025-11-05T14:00:00Z',
      all_day: false,
      timezone: 'Europe/Paris',
      status: 'tentative',
      visibility: 'public',
      show_as: 'tentative',
      organizer: {
        email: 'sales@example.com',
        name: 'Sales Team',
        role: 'chair',
        status: 'needs-action',
      },
      reminders: [{ method: 'email', minutes_before: 120 }],
      created_at: '2025-10-28T09:00:00Z',
      updated_at: '2025-10-28T09:00:00Z',
      sequence: 0,
    },

    // All-day event
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
      created_at: '2025-09-01T08:00:00Z',
      updated_at: '2025-09-01T08:00:00Z',
      sequence: 0,
    },
  ],

  'shared-cal-1': [
    // Recurring event
    {
      id: 'evt_003',
      calendar_id: 'shared-cal-1',
      uid: 'evt_003@sogo.example.com',
      title: 'Weekly Planning Meeting',
      description: 'Review progress and plan for the week',
      location: 'Virtual - Teams',
      start_date: '2025-10-28T14:00:00Z',
      end_date: '2025-10-28T15:00:00Z',
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
      created_at: '2025-01-05T10:00:00Z',
      updated_at: '2025-01-05T10:00:00Z',
      sequence: 0,
    },

    // Detailed strategic planning event
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
      start_date: '2025-11-10T09:00:00Z',
      end_date: '2025-11-10T12:00:00Z',
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
      created_at: '2025-10-01T10:30:00Z',
      updated_at: '2025-10-26T14:45:00Z',
      sequence: 3,
    },
  ],

  'personal-cal-2': [],
  'personal-cal-3': [],
  'shared-cal-2': [],
  'sub-cal-1': [],
}

/**
 * GET /fakeApi/calendars/[calendarId]/events
 * Returns a list of events for a specific calendar
 */
export async function GET(
  request: Request,
  { params }: { params: { calendarId: string } }
) {
  const calendarId = params.calendarId
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
  { params }: { params: { calendarId: string } }
) {
  const calendarId = params.calendarId
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

  if (!eventsData[calendarId]) {
    eventsData[calendarId] = []
  }
  eventsData[calendarId].push(newEvent)

  return NextResponse.json(newEvent, { status: 201 })
}

/**
 * OPTIONS /fakeApi/calendars/[calendarId]/events
 * Returns allowed HTTP methods
 */
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
