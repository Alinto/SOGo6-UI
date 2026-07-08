export type { BackendResponse } from '@/lib/api/backend-response'

export interface ApiForward {
  enabled: boolean
  forward_address: string[]
  keep_copy: boolean
  always_send: boolean
}

/** Legacy camelCase shape from older fakeApi responses */
export interface ApiForwardLegacy {
  enabled?: boolean | 0 | 1
  forwardAddress?: string[]
  keepCopy?: boolean | 0 | 1
  alwaysSend?: boolean | 0 | 1
}

export interface ApiForwardGetResponse {
  forward: ApiForward | ApiForwardLegacy | null
}

export interface ApiForwardPostResponse {
  filters: unknown
  forward: ApiForward | ApiForwardLegacy | null
  vacation: unknown
  notification: unknown
}

export interface ApiForwardPostBody {
  Forward: ApiForward
}
