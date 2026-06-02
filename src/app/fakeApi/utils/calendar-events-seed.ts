import type { CalendarEvent } from '@/features/calendars/calendars-types'

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
  const today = new Date()
  const currentDay = today.getDay()
  let daysToAdd = dayOfWeek - currentDay
  if (daysToAdd <= 0) daysToAdd += 7
  const nextDay = new Date(today)
  nextDay.setDate(today.getDate() + daysToAdd)
  nextDay.setHours(0, 0, 0, 0)
  return nextDay
}

export function formatDateWithTime(
  date: Date,
  hours: number,
  minutes: number = 0
): string {
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export function formatDateAllDay(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/**
 * Generates the default seed events with dates relative to today.
 * Called once on first visit to initialize the demo cookie.
 */
export function generateDefaultCalendarEvents(): Record<
  string,
  CalendarEvent[]
> {
  const today = getToday()
  const tomorrow = getTomorrow()
  const inTwoDays = getDaysFromToday(2)
  const nextMonday = getNextWeekday(1)
  const nextFriday = getNextWeekday(5)
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
        categories: ['Work', 'Important'],
        related_to: [],
        url: 'https://example.com/team-standup',
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
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
        related_to: [],
        reminders: [
          { method: 'popup', minutes_before: 60 },
          { method: 'email', minutes_before: 1440 },
        ],
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
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
        categories: ['Work', 'Review'],
        related_to: [],
        url: 'https://example.com/project-review',
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
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
        categories: ['Client', 'Important'],
        related_to: [],
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
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
        end_date: formatDateAllDay(getDaysFromToday(9)),
        all_day: true,
        timezone: 'Europe/Paris',
        status: 'confirmed',
        visibility: 'public',
        show_as: 'out-of-office',
        categories: ['Company'],
        related_to: [],
        url: 'https://example.com/annual-conference',
        organizer: {
          email: 'hr@example.com',
          name: 'HR Department',
          role: 'chair',
        },
        reminders: [
          { method: 'email', minutes_before: 1440 },
          { method: 'popup', minutes_before: 10080 },
        ],
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
        categories: ['Work'],
        related_to: [],
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
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
        categories: ['Planning'],
        related_to: [],
        url: 'https://example.com/weekly-planning',
        organizer: {
          email: 'team-lead@example.com',
          name: 'Team Lead',
          role: 'chair',
          status: 'accepted',
        },
        attendees: [
          {
            email: 'sogo-tests1@example.org',
            name: 'John Paul',
            role: 'required',
            status: 'needs-action',
          },
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
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
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
        categories: ['Strategy', 'Confidential'],
        related_to: [],
        url: 'https://example.com/q4-strategy',
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
          { method: 'popup', minutes_before: 15 },
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
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        sequence: 3,
      },
    ],

    'personal-cal-2': [],
    'personal-cal-3': [],
    'shared-cal-2': [],
    'sub-cal-1': [],
  }
}
