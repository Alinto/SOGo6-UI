// Event attendee/participant
export interface EventAttendee {
  email: string
  name?: string
  role?: 'required' | 'optional' | 'chair' | 'non-participant'
  status?: 'needs-action' | 'accepted' | 'declined' | 'tentative'
  rsvp?: boolean
}

// Recurrence rule (RRULE)
export interface EventRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number
  count?: number
  until?: string // ISO date
  by_day?: string[] // ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
  by_month_day?: number[]
  by_month?: number[]
}

// Event reminder/alarm
export interface EventReminder {
  method: 'email' | 'popup' | 'notification'
  minutes_before: number
}

// Calendar event
export interface CalendarEvent {
  id: string
  calendar_id: string
  uid?: string // iCalendar UID
  title: string
  description?: string
  location?: string
  start_date: string // ISO datetime
  end_date: string // ISO datetime
  all_day: boolean
  timezone?: string

  // Status and visibility
  status?: 'confirmed' | 'tentative' | 'cancelled'
  visibility?: 'public' | 'private' | 'confidential'
  show_as?: 'free' | 'busy' | 'tentative' | 'out-of-office'

  // Participants
  organizer?: EventAttendee
  attendees?: EventAttendee[]

  // Recurrence
  recurrence?: EventRecurrence
  recurrence_id?: string // For edited instances of recurring events

  // Reminders
  reminders?: EventReminder[]

  // Metadata
  created_at: string
  updated_at: string
  sequence?: number // Version number for updates

  // Attachments and links
  attachments?: Array<{
    filename: string
    mime_type: string
    url: string
    size?: number
  }>
  conference_data?: {
    type: 'hangoutsMeet' | 'zoom' | 'teams' | 'custom'
    url: string
    conference_id?: string
    entry_points?: Array<{
      type: 'video' | 'phone' | 'sip'
      uri: string
      label?: string
    }>
  }

  // Additional properties
  color?: string
  transparency?: 'opaque' | 'transparent'
  locked?: boolean
  source?: string // URL for imported events
}

export interface CalendarEventsResponse {
  events: CalendarEvent[]
  next_page_token?: string
  total_count?: number
}

export interface Calendar {
  id: string
  name: string
  description: string
  color?: string
  type: 'personal' | 'shared' | 'subscription'
  default?: boolean
  read_only?: boolean
  owner?: string
  permissions?: 'read' | 'readwrite'
  url?: string // For subscription calendars
  event_duration?: number // in minutes
  event_notifications?: EventReminder[]
  all_day_notifications?: EventReminder[]
  show_as_busy?: boolean
  created_at?: string
  updated_at?: string
}

export interface CalendarsResponse {
  personal: Calendar[]
  shared: Calendar[]
  subscriptions: Calendar[]
}

export type CalendarType = 'personal' | 'shared' | 'subscription'
