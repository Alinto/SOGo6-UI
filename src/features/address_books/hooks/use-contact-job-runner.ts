'use client'

import {
  downloadBlobAsFile,
  filenameFromContentDisposition,
  useCancelJobMutation,
  useJobPolling,
  useLazyGetJobResultQuery,
} from '@/features/jobs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type JobMeta = {
  operation?: 'import' | 'export'
  label?: string
  format?: string
}

export function useContactJobRunner() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobMeta, setJobMeta] = useState<JobMeta | null>(null)
  const [fetchJobResult] = useLazyGetJobResultQuery()
  const [cancelJobMutation, { isLoading: isCancelling }] = useCancelJobMutation()
  const exportHandledRef = useRef(false)

  const reset = useCallback(() => {
    setJobId(null)
    setJobMeta(null)
    exportHandledRef.current = false
  }, [])

  const startJob = useCallback(
    (response: { job_id: string }, meta?: JobMeta) => {
      exportHandledRef.current = false
      setJobMeta(meta ?? null)
      setJobId(response.job_id)
    },
    []
  )

  const downloadExport = useCallback(
    async (jobIdValue: string, fallbackFilename: string) => {
      const result = await fetchJobResult({
        jobId: jobIdValue,
        download: true,
      }).unwrap()

      const filename = filenameFromContentDisposition(
        result.contentDisposition,
        fallbackFilename
      )
      downloadBlobAsFile(result.blob, filename)
    },
    [fetchJobResult]
  )

  const cancelJob = useCallback(async () => {
    if (!jobId) return
    await cancelJobMutation(jobId).unwrap()
    reset()
  }, [cancelJobMutation, jobId, reset])

  const { status, isPolling, isSuccess, isFailure, jobState } = useJobPolling(jobId)

  const importSummary = useMemo(() => {
    if (!isSuccess || jobMeta?.operation !== 'import' || !jobState?.result) {
      return null
    }

    const result = jobState.result
    const created = String(result.created ?? 0)
    const updated = String(result.updated ?? 0)
    const skipped = String(result.skipped ?? 0)
    return `${created}/${updated}/${skipped}`
  }, [isSuccess, jobMeta?.operation, jobState?.result])

  useEffect(() => {
    if (!isSuccess || !jobId || !jobMeta || exportHandledRef.current) return

    if (jobMeta.operation === 'export' && jobMeta.label && jobMeta.format) {
      exportHandledRef.current = true
      const extension = jobMeta.format === 'json' ? 'json' : jobMeta.format === 'ldif' ? 'ldif' : 'vcf'
      const fallback = `${jobMeta.label.replace(/[^\w.-]+/g, '_')}.${extension}`
      void downloadExport(jobId, fallback)
    }
  }, [downloadExport, isSuccess, jobId, jobMeta])

  return {
    jobId,
    status,
    isPolling,
    isSuccess,
    isFailure,
    statusMessage: importSummary,
    startJob,
    reset,
    cancelJob,
    isCancelling,
    downloadExport,
  }
}
