'use client'

import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useExportCalendarMutation } from '@/features/calendars/store/calendars-api'
import {
  downloadBlobAsFile,
  filenameFromContentDisposition,
  useJobPolling,
  useLazyGetJobResultQuery,
} from '@/features/jobs'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useCallback, useRef, useState } from 'react'

interface ExportActionProps {
  calendarKey: string
  name: string
  onClose?: () => void
}

export function icsFallbackFilename(name: string, calendarKey: string): string {
  const base = (name.trim() || calendarKey).replace(/[^\w.-]+/g, '_')
  return base.toLowerCase().endsWith('.ics') ? base : `${base}.ics`
}

const ExportAction: React.FC<ExportActionProps> = ({
  calendarKey,
  name,
  onClose,
}) => {
  const t = useTranslations('CALENDARS')
  const [exportCalendar, { isLoading }] = useExportCalendarMutation()
  const [fetchJobResult] = useLazyGetJobResultQuery()
  const [jobId, setJobId] = useState<string | null>(null)
  const [phase, setPhase] = useState<'idle' | 'success' | 'error'>('idle')
  const handledRef = useRef(false)

  const download = useCallback(
    async (id: string) => {
      if (handledRef.current) return
      handledRef.current = true
      try {
        const result = await fetchJobResult({
          jobId: id,
          download: true,
        }).unwrap()
        const filename = filenameFromContentDisposition(
          result.contentDisposition,
          icsFallbackFilename(name, calendarKey)
        )
        downloadBlobAsFile(result.blob, filename)
        setPhase('success')
      } catch {
        handledRef.current = false
        setPhase('error')
      }
    },
    [calendarKey, fetchJobResult, name]
  )

  const { isPolling } = useJobPolling(jobId, {
    onSuccess: () => {
      if (jobId) void download(jobId)
    },
    onFailure: () => setPhase('error'),
    onCanceled: () => setPhase('error'),
  })

  const handleSubmit = async () => {
    setPhase('idle')
    handledRef.current = false
    try {
      const response = await exportCalendar({ calendarKey }).unwrap()
      setJobId(response.job_id)
    } catch {
      setPhase('error')
    }
  }

  const isRunning =
    isLoading || isPolling || (jobId != null && phase === 'idle')

  if (phase === 'success') {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t('sidebar.export.string')}</DialogTitle>
          <DialogDescription>
            {t('sidebar.export.success.string')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('sidebar.export.close.string')}
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sidebar.export.title.string', { name })}</DialogTitle>
        <DialogDescription>
          {t('sidebar.export.description.string')}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        {phase === 'error' && (
          <p className="text-destructive text-sm">
            {t('sidebar.export.error.string')}
          </p>
        )}
        {isRunning && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t('sidebar.export.processing.string')}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isRunning}
        >
          {t('sidebar.export.cancel.string')}
        </Button>
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isRunning}
        >
          {isRunning && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          )}
          {t('sidebar.export.submit.string')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default memo(ExportAction)
