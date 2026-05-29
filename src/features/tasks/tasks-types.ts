import type {
  EventAttendee,
  EventReminder,
} from '@/features/calendars/calendars-types'

export type TaskStatus =
  | 'needs_action'
  | 'in_process'
  | 'completed'
  | 'cancelled'

/** Smart views in the tasks sidebar (navigation). */
export type TaskListFilter =
  | 'all'
  | 'today'
  | 'upcoming'
  | 'overdue'
  | 'completed'

export type TaskVisibility = 'public' | 'private' | 'confidential'

export interface Task {
  key?: string
  id: string | null
  calendar_key?: string
  calendar_id?: string | null
  uid?: string
  title: string
  description?: string | null
  date_start?: string | null
  due?: string | null
  status?: TaskStatus
  visibility?: TaskVisibility
  priority?: number
  percent_complete?: number | null
  completed_at?: string | null
  categories?: string[]
  reminders?: EventReminder[]
  organizer?: EventAttendee | null
  attendees?: EventAttendee[]
  related_to?: string[]
  component_type?: 'task'
  created_at?: string | null
  updated_at?: string | null
}

export type TaskCreateBody = {
  title: string
  description?: string | null
  date_start?: string | null
  due?: string | null
  status?: TaskStatus | null
  visibility?: TaskVisibility | null
  priority?: number
  percent_complete?: number | null
  completed_at?: string | null
  categories?: string[]
  reminders?: EventReminder[]
  organizer?: EventAttendee | null
  attendees?: EventAttendee[]
  related_to?: string[]
}

export type TaskUpdateBody = Partial<TaskCreateBody>

export interface ApiTaskResponse {
  data: Task
  error_code: string
  error_msg: string
}

export interface ApiTaskListResponse {
  data: {
    tasks: Task[]
    total_count: number
  }
  error_code: string
  error_msg: string
}

export interface TaskQueryParams {
  start_date_time?: string
  end_date_time?: string
  search?: string
}
