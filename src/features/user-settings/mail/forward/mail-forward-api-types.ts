export type { BackendResponse } from '@/lib/api/backend-response'

export interface ApiForward {
  enabled: 0 | 1
  forwardAddress: string[]
  keepCopy: 0 | 1
  alwaysSend: 0 | 1
}

export interface ApiForwardGetResponse {
  forward: ApiForward | null
}

export interface ApiForwardPostResponse {
  filters: unknown
  forward: ApiForward | null
  vacation: unknown
  notification: unknown
}

export interface ApiForwardPostBody {
  Forward: ApiForward
}
