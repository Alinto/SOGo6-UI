export type JobStatus =
  | 'pending'
  | 'started'
  | 'success'
  | 'failure'
  | 'retry'
  | 'canceled'

export interface JobState {
  status: JobStatus
  payload?: Record<string, unknown>
  result?: Record<string, unknown> | null
  error?: string | null
}

export interface ApiJobResponse {
  data: JobState
  error_code?: string
  error_msg?: string
}

export interface ContactJobEnqueueData {
  job_id: string
}

export interface ContactJobEnqueueResponse {
  data: ContactJobEnqueueData
  error_code?: string
  error_msg?: string
}

export function isTerminalJobStatus(status: JobStatus | undefined): boolean {
  return (
    status === 'success' ||
    status === 'failure' ||
    status === 'canceled'
  )
}
