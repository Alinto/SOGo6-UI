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
  key?: string
  id: string | null
  calendar_key?: string
  calendar_id: string | null
  uid?: string // iCalendar UID
  title: string
  description?: string
  location?: string
  date_start?: string // Backend ISO datetime
  date_end?: string // Backend ISO datetime
  start_date?: string // Frontend-normalized ISO datetime
  end_date?: string // Frontend-normalized ISO datetime
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
  categories?: string[]
  related_to?: string[]
  url?: string | null
  transparency?: 'opaque' | 'transparent'
  locked?: boolean
  source?: string // URL for imported events
}

export interface CalendarEventsResponse {
  events: CalendarEvent[]
  next_page_token?: string
  total_count?: number
}

export type CalendarEventQueryArgs = {
  start_date_time?: string
  end_date_time?: string
  search?: string
}

export type CalendarEventCreateBody = {
  title: string
  date_start: string
  date_end: string
  description?: string
  location?: string
  all_day?: boolean
  timezone?: string
  status?: string
  visibility?: string
  show_as?: string
  url?: string
  categories?: string[]
  attendees?: EventAttendee[]
}

export type CalendarEventUpdateBody = Partial<CalendarEventCreateBody>

export interface ApiCalendarEventResponse {
  data: CalendarEvent
  error_code: string
  error_msg: string
}

export interface ApiCalendarEventsResponse {
  data: {
    events: CalendarEvent[]
    total_count: number
  }
  error_code: string
  error_msg: string
}

export type Calendar = {
  // --- Real backend fields (CalendarSchema) ---
  key?: string
  name: string
  color?: string
  description: string | null
  timezone?: string
  is_default?: boolean
  source_type?: string
  ctag?: number
  share_token?: string | null
  created_at?: string
  updated_at?: string

  // --- Frontend-normalized field ---
  id?: string

  // --- UI-only field, never sent to the backend ---
  u_hidden?: boolean

  // --- Legacy fakeApi fields kept for existing components. ---
  visible?: boolean
  type?: 'personal' | 'shared' | 'subscription'
  default?: boolean
  read_only?: boolean
  owner?: string
  owner_uid?: string
  permissions?: 'read' | 'readwrite'
  url?: string // For subscription calendars
  event_duration?: number // in minutes
  event_notifications?: EventReminder[]
  all_day_notifications?: EventReminder[]
  show_as_busy?: boolean
}

export interface CalendarsResponse {
  personal: Calendar[]
  shared: Calendar[]
  subscriptions: Calendar[]
}

export type CalendarType = 'personal' | 'shared' | 'subscription'

export type CalendarCreateBody = {
  name: string
  color?: string
  description?: string | null
  timezone?: string
}

export type CalendarUpdateBody = {
  name?: string
  color?: string
  description?: string | null
  timezone?: string
  is_default?: boolean
}

export type ApiCalendarsResponse = {
  data: { calendars: Calendar[]; total_count: number }
  error_code: string
  error_msg: string
}

export type ApiCalendarResponse = {
  data: Calendar
  error_code: string
  error_msg: string
}
