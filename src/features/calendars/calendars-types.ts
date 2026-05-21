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
  recurrence_rule?: EventRecurrence | null
  recurrence_id?: string | null
  recurrence_range?: 'ONE' | 'THISANDFUTURE' | 'ALL' | null

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
  status?: 'confirmed' | 'tentative' | 'cancelled'
  visibility?: 'public' | 'private' | 'confidential'
  show_as?: 'busy' | 'free' | 'out-of-office' | 'tentative'
  url?: string
  color?: string
  categories?: string[]
  attendees?: EventAttendee[]
  reminders?: EventReminder[]
  recurrence_rule?: {
    frequency: string
    interval?: number
    until?: string
    count?: number
    by_day?: string[]
    by_month_day?: number[]
    by_month?: number[]
    week_start?: string
  } | null
}

export type CalendarEventUpdateBody = Partial<CalendarEventCreateBody> & {
  recurrence_id?: string
  recurrence_range?: 'ONE' | 'THISANDFUTURE' | 'ALL'
}

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
  /** fakeApi / legacy form fields */
  type?: CalendarType
  eventDuration?: string
  showBusyStatus?: boolean
  eventNotifications?: Array<{ type: string; timing: string }>
  allDayNotifications?: Array<{
    type: string
    daysBefore: number
    time: string
  }>
  url?: string
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

// ─── FreeBusy types ───────────────────────────────────────────────────────────

/**
 * Values returned by the backend (FreeBusyType.py).
 * Includes `no_info` for slots with no data on the frontend.
 */
export type FreeBusyPeriodType = 'busy' | 'tentative' | 'unavailable' | 'no_info'

export interface FreeBusyPeriod {
  /** Compact UTC backend format: "YYYYMMDDTHHmmSSZ", e.g. "20260511T090000Z" */
  start: string
  end: string
  type: FreeBusyPeriodType
  title?: string | null
}

export interface FreeBusyAttendeeResult {
  periods: FreeBusyPeriod[]
}

/** Exact shape of `data` in the backend FreeBusyDataSchema response */
export interface FreeBusyData {
  start: string
  end: string
  /** Map of email/uid → { periods } */
  attendees: Record<string, FreeBusyAttendeeResult>
  is_available: boolean | null
}

/** ApiBaseResponse-style wrapper from the backend */
export interface FreeBusyApiResponse {
  data: FreeBusyData | null
  error_code?: string | null
  error_msg?: string | null
}

/** Request body sent to the backend (FreeBusyRequestSchema) */
export interface FreeBusyRequest {
  target_uids: string[] // participant emails / uids
  start_date_time: string // ISO 8601 UTC, e.g. "2026-05-11T00:00:00Z"
  end_date_time: string // ISO 8601 UTC, e.g. "2026-05-11T23:59:59Z"
}

/**
 * Internal attendee shape for AttendeeInput and FreeBusyTimeline.
 * Distinct from EventAttendee — do not change EventAttendee for this.
 */
export interface AttendeeInputItem {
  email: string
  name?: string
  status?: 'needs-action' | 'accepted' | 'declined' | 'tentative'
}

export interface UserSearchResult {
  uid: string
  email: string
  name: string
  department?: string
  avatar_url?: string
}

export type AttendanceStatus = 'accepted' | 'declined' | 'tentative' | 'delegated'

export interface AttendanceBody {
  status: AttendanceStatus
  recurrence_id?: string
}
