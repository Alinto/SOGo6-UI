export type { BackendResponse } from '@/lib/api/backend-response'

export interface ApiVacation {
  enabled: 0 | 1
  customSubjectEnabled: boolean
  customSubject: string
  autoReplyText: string
  startDate: string | null
  endDate: string | null
  timezone: string | null
  alwaysSend: 0 | 1
  ignoreLists: boolean
  startTime: string | null
  endTime: string | null
  weekdaysEnabled: boolean
  days: number[]
}

export interface ApiVacationGetResponse {
  vacation: ApiVacation | null
}

export interface ApiVacationPostResponse {
  filters: unknown
  vacation: ApiVacation | null
  forward: unknown
  notification: unknown
}

export interface ApiVacationPostBody {
  Vacation: ApiVacation
}
