export type { BackendResponse } from '@/lib/api/backend-response'

export interface ApiVacation {
  enabled: boolean
  custom_subject_enabled: boolean
  custom_subject: string
  auto_reply_text: string
  start_date: string | null
  end_date: string | null
  timezone: string | null
  always_send: boolean
  start_time: string | null
  end_time: string | null
  weekdays_enabled: boolean
  weekday: number[]
  days: number | null
}

/** Legacy camelCase shape from older fakeApi responses */
export interface ApiVacationLegacy {
  enabled?: boolean | 0 | 1
  customSubjectEnabled?: boolean
  customSubject?: string
  autoReplyText?: string
  startDate?: string | null
  endDate?: string | null
  timezone?: string | null
  alwaysSend?: boolean | 0 | 1
  startTime?: string | null
  endTime?: string | null
  weekdaysEnabled?: boolean
  days?: number[] | number | null
  ignoreLists?: boolean
}

export interface ApiVacationGetResponse {
  vacation: ApiVacation | ApiVacationLegacy | null
}

export interface ApiVacationPostResponse {
  filters: unknown
  vacation: ApiVacation | ApiVacationLegacy | null
  forward: unknown
  notification: unknown
}

export interface ApiVacationPostBody {
  Vacation: ApiVacation
}
