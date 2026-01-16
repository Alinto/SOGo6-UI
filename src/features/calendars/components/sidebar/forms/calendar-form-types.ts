// Base type shared between creation and edition forms
export interface BaseCalendarFormData {
  name: string
  color: string
  description?: string
  eventDuration: string
  eventNotifications?: Array<{
    type: 'notification' | 'email'
    timing: string
  }>
  allDayNotifications?: Array<{
    type: 'notification' | 'email'
    daysBefore: number
    time: string
  }>
  showBusyStatus: boolean
}

// Type for calendar creation (without id)
export type CalendarAddFormData = BaseCalendarFormData

// Type for calendar edition (with id)
export interface CalendarEditFormData extends BaseCalendarFormData {
  id: string
}
