import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { NextResponse } from 'next/server'

// This would normally fetch from the events data in the parent route
// For now, we'll return a single detailed example
const singleEventExample: CalendarEvent = {
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
}

/**
 * GET /fakeApi/calendars/[calendarId]/events/[eventId]
 * Returns a single event by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { calendarId: string; eventId: string } }
) {
  // In a real API, you would fetch the specific event
  // For now, return the example event with the requested ID
  const event = {
    ...singleEventExample,
    id: params.eventId,
    calendar_id: params.calendarId,
  }
  return NextResponse.json(event)
}

/**
 * PATCH /fakeApi/calendars/[calendarId]/events/[eventId]
 * Update an event
 */
export async function PATCH(
  request: Request,
  { params }: { params: { calendarId: string; eventId: string } }
) {
  const body = await request.json()

  const updatedEvent: CalendarEvent = {
    ...singleEventExample,
    id: params.eventId,
    calendar_id: params.calendarId,
    ...body,
    updated_at: new Date().toISOString(),
    sequence: (body.sequence || 0) + 1,
  }

  return NextResponse.json(updatedEvent)
}

/**
 * DELETE /fakeApi/calendars/[calendarId]/events/[eventId]
 * Delete an event
 */
export async function DELETE(
  request: Request,
  { params }: { params: { calendarId: string; eventId: string } }
) {
  return NextResponse.json({ success: true, deleted_id: params.eventId })
}

/**
 * OPTIONS /fakeApi/calendars/[calendarId]/events/[eventId]
 * Returns allowed HTTP methods
 */
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PATCH', 'DELETE'] },
    { status: 200 }
  )
}
