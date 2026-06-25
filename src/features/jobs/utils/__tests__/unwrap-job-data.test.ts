import { unwrapJobId, unwrapJobState } from '../unwrap-job-data'

describe('unwrap-job-data', () => {
  it('unwraps job state from API envelope', () => {
    expect(
      unwrapJobState({
        data: { job_id: 'job-1', status: 'pending' },
        error_code: 'S000000',
      })
    ).toEqual({ job_id: 'job-1', status: 'pending' })
  })

  it('returns raw state when envelope is absent', () => {
    expect(unwrapJobState({ job_id: 'job-2', status: 'success' })).toEqual({
      job_id: 'job-2',
      status: 'success',
    })
  })

  it('unwraps job id from enqueue response', () => {
    expect(
      unwrapJobId({
        data: { job_id: 'job-3' },
        error_code: 'S000000',
      })
    ).toBe('job-3')
  })

  it('returns flat job id when already unwrapped', () => {
    expect(unwrapJobId({ job_id: 'job-4' })).toBe('job-4')
  })
})
