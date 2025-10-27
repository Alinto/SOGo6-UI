export interface EventNotification {
  type: 'notification' | 'email'
  trigger: string
}

export interface AllDayNotification {
  type: 'notification' | 'email'
  days_before: number
  time?: string
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
  event_notifications?: EventNotification[]
  all_day_notifications?: AllDayNotification[]
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
