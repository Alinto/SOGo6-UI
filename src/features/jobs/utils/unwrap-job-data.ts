import type { ApiJobResponse, ContactJobEnqueueResponse } from '../jobs-api-types'

export function unwrapJobState(response: ApiJobResponse | JobStateLike): JobStateLike {
  if (response && typeof response === 'object' && 'data' in response && response.data) {
    return response.data as JobStateLike
  }
  return response as JobStateLike
}

export function unwrapJobId(
  response: ContactJobEnqueueResponse | { job_id: string }
): string {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ContactJobEnqueueResponse).data.job_id
  }
  return (response as { job_id: string }).job_id
}

type JobStateLike = ApiJobResponse['data']
