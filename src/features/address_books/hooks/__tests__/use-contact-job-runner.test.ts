import { act, renderHook, waitFor } from '@testing-library/react'

const mockUseJobPolling = jest.fn()
const mockFetchJobResult = jest.fn()
const mockCancelJobMutation = jest.fn()
const mockDownloadBlobAsFile = jest.fn()

jest.mock('@/features/jobs', () => ({
  useJobPolling: (...args: unknown[]) => mockUseJobPolling(...args),
  useLazyGetJobResultQuery: () => [mockFetchJobResult],
  useCancelJobMutation: () => [mockCancelJobMutation, { isLoading: false }],
  downloadBlobAsFile: (...args: unknown[]) => mockDownloadBlobAsFile(...args),
  filenameFromContentDisposition: (_header: string | null, fallback: string) =>
    fallback,
}))

import { useContactJobRunner } from '../use-contact-job-runner'

describe('useContactJobRunner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseJobPolling.mockReturnValue({
      status: undefined,
      isPolling: false,
      isSuccess: false,
      isFailure: false,
      jobState: undefined,
    })
    mockFetchJobResult.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          blob: new Blob(['data']),
          contentDisposition: null,
          contentType: 'application/octet-stream',
        }),
    })
    mockCancelJobMutation.mockReturnValue({
      unwrap: () => Promise.resolve({ status: 'canceled' }),
    })
  })

  it('starts polling with job id and meta', () => {
    const { result } = renderHook(() => useContactJobRunner())

    act(() => {
      result.current.startJob({ job_id: 'job-1' }, { operation: 'import' })
    })

    expect(result.current.jobId).toBe('job-1')
  })

  it('downloads export result on success', async () => {
    mockUseJobPolling.mockReturnValue({
      status: 'success',
      isPolling: false,
      isSuccess: true,
      isFailure: false,
      jobState: { status: 'success', result: {} },
    })

    const { result, rerender } = renderHook(() => useContactJobRunner())

    act(() => {
      result.current.startJob(
        { job_id: 'job-export' },
        { operation: 'export', label: 'Work Book', format: 'json' }
      )
    })

    rerender()

    await waitFor(() => {
      expect(mockFetchJobResult).toHaveBeenCalledWith({
        jobId: 'job-export',
        download: true,
      })
    })
    expect(mockDownloadBlobAsFile).toHaveBeenCalled()
  })

  it('cancels active job and resets state', async () => {
    const { result } = renderHook(() => useContactJobRunner())

    act(() => {
      result.current.startJob({ job_id: 'job-2' })
    })

    await act(async () => {
      await result.current.cancelJob()
    })

    expect(mockCancelJobMutation).toHaveBeenCalledWith('job-2')
    expect(result.current.jobId).toBeNull()
  })
})
