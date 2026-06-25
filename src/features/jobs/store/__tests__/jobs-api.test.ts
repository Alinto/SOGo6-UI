import { jobsApiEndpoints } from '../jobs-api'

describe('jobs-api', () => {
  it('exposes job endpoints', () => {
    expect(jobsApiEndpoints.getJob).toBeDefined()
    expect(jobsApiEndpoints.cancelJob).toBeDefined()
    expect(jobsApiEndpoints.getJobResult).toBeDefined()
  })
})
