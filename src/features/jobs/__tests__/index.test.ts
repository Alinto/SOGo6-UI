import * as Jobs from '../index'

describe('jobs feature index', () => {
  it('exports job polling hook', () => {
    expect(typeof Jobs.useJobPolling).toBe('function')
  })

  it('exports RTK Query job hooks', () => {
    expect(typeof Jobs.useGetJobQuery).toBe('function')
    expect(typeof Jobs.useCancelJobMutation).toBe('function')
    expect(typeof Jobs.useLazyGetJobResultQuery).toBe('function')
  })

  it('exports download helpers', () => {
    expect(typeof Jobs.downloadBlobAsFile).toBe('function')
    expect(typeof Jobs.filenameFromContentDisposition).toBe('function')
  })

  it('exports unwrap helpers and terminal status check', () => {
    expect(typeof Jobs.unwrapJobId).toBe('function')
    expect(typeof Jobs.unwrapJobState).toBe('function')
    expect(typeof Jobs.isTerminalJobStatus).toBe('function')
  })
})
