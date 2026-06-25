import { act, renderHook } from '@testing-library/react'

const mockUseGetJobQuery = jest.fn()

jest.mock('../../store/jobs-api', () => ({
  useGetJobQuery: (...args: unknown[]) => mockUseGetJobQuery(...args),
}))

import { useJobPolling } from '../use-job-polling'

describe('useJobPolling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetJobQuery.mockReturnValue({
      data: { status: 'pending', job_id: 'job-1' },
      isLoading: false,
      isFetching: true,
      error: undefined,
    })
  })

  it('polls while job is not terminal', () => {
    const { result } = renderHook(() => useJobPolling('job-1'))
    expect(result.current.isPolling).toBe(true)
    expect(result.current.isSuccess).toBe(false)
  })

  it('reports success when job completes', () => {
    mockUseGetJobQuery.mockReturnValue({
      data: { status: 'success', job_id: 'job-1', result: {} },
      isLoading: false,
      isFetching: false,
      error: undefined,
    })

    const onSuccess = jest.fn()
    renderHook(() => useJobPolling('job-1', { onSuccess }))

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success' })
    )
  })

  it('skips polling when job id is missing', () => {
    renderHook(() => useJobPolling(null))
    expect(mockUseGetJobQuery).toHaveBeenCalledWith('', expect.objectContaining({ skip: true }))
  })

  it('resets status tracking when job id changes', () => {
    const onSuccess = jest.fn()
    const { rerender } = renderHook(
      ({ jobId }: { jobId: string | null }) => useJobPolling(jobId, { onSuccess }),
      { initialProps: { jobId: 'job-1' as string | null } }
    )

    mockUseGetJobQuery.mockReturnValue({
      data: { status: 'success', job_id: 'job-2' },
      isLoading: false,
      isFetching: false,
      error: undefined,
    })

    act(() => {
      rerender({ jobId: 'job-2' })
    })

    expect(onSuccess).toHaveBeenCalled()
  })
})
