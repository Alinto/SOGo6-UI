'use client'

import { useEffect, useRef } from 'react'
import {
  isTerminalJobStatus,
  type JobState,
  type JobStatus,
} from '../jobs-api-types'
import { useGetJobQuery } from '../store/jobs-api'

const DEFAULT_POLL_INTERVAL_MS = 1500

export interface UseJobPollingOptions {
  enabled?: boolean
  pollIntervalMs?: number
  onSuccess?: (state: JobState) => void
  onFailure?: (state: JobState) => void
  onCanceled?: (state: JobState) => void
}

export interface UseJobPollingResult {
  jobState: JobState | undefined
  status: JobStatus | undefined
  isLoading: boolean
  isPolling: boolean
  isTerminal: boolean
  isSuccess: boolean
  isFailure: boolean
  isCanceled: boolean
  error: unknown
}

export function useJobPolling(
  jobId: string | null | undefined,
  options: UseJobPollingOptions = {}
): UseJobPollingResult {
  const {
    enabled = true,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    onSuccess,
    onFailure,
    onCanceled,
  } = options

  const shouldPoll = Boolean(enabled && jobId)
  const previousStatusRef = useRef<JobStatus | undefined>(undefined)

  const { data: jobState, isLoading, isFetching, error } = useGetJobQuery(
    jobId ?? '',
    {
      skip: !shouldPoll,
      pollingInterval: shouldPoll ? pollIntervalMs : 0,
    }
  )

  const status = jobState?.status
  const isTerminal = isTerminalJobStatus(status)

  useEffect(() => {
    if (!jobState || !status) return
    if (previousStatusRef.current === status) return

    previousStatusRef.current = status

    if (status === 'success') {
      onSuccess?.(jobState)
    } else if (status === 'failure') {
      onFailure?.(jobState)
    } else if (status === 'canceled') {
      onCanceled?.(jobState)
    }
  }, [jobState, status, onCanceled, onFailure, onSuccess])

  useEffect(() => {
    if (!jobId) {
      previousStatusRef.current = undefined
    }
  }, [jobId])

  return {
    jobState,
    status,
    isLoading,
    isPolling: shouldPoll && !isTerminal && (isLoading || isFetching),
    isTerminal,
    isSuccess: status === 'success',
    isFailure: status === 'failure',
    isCanceled: status === 'canceled',
    error,
  }
}
