'use client'

import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useImportCalendarMutation } from '@/features/calendars/store/calendars-api'
import { useJobPolling } from '@/features/jobs'
import { CALENDAR_EVENTS_SLICE, apiSlice } from '@/lib/redux/api/api-slice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useState } from 'react'

interface ImportActionProps {
  calendarKey: string
  name: string
  onClose?: () => void
}

const ImportAction: React.FC<ImportActionProps> = ({
  calendarKey,
  name,
  onClose,
}) => {
  const t = useTranslations('CALENDARS')
  const dispatch = useAppDispatch()
  const [importCalendar, { isLoading }] = useImportCalendarMutation()
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [phase, setPhase] = useState<'idle' | 'success' | 'error'>('idle')

  const { isPolling } = useJobPolling(jobId, {
    onSuccess: () => {
      dispatch(apiSlice.util.invalidateTags([CALENDAR_EVENTS_SLICE]))
      setPhase('success')
    },
    onFailure: () => setPhase('error'),
    onCanceled: () => setPhase('error'),
  })

  const handleSubmit = async () => {
    if (!file) return
    setPhase('idle')
    try {
      const response = await importCalendar({ calendarKey, file }).unwrap()
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
          <DialogTitle>{t('sidebar.import.string')}</DialogTitle>
          <DialogDescription>
            {t('sidebar.import.success.string')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('sidebar.import.close.string')}
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sidebar.import.title.string', { name })}</DialogTitle>
        <DialogDescription>
          {t('sidebar.import.description.string')}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <label className="block space-y-2 text-sm">
          <span>{t('sidebar.import.file.string')}</span>
          <Input
            type="file"
            accept=".ics,text/calendar"
            aria-label={t('sidebar.import.file.string')}
            disabled={isRunning}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null)
              setPhase('idle')
            }}
          />
        </label>
        {phase === 'error' && (
          <p className="text-destructive text-sm">
            {t('sidebar.import.error.string')}
          </p>
        )}
        {isRunning && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t('sidebar.import.processing.string')}
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
          {t('sidebar.import.cancel.string')}
        </Button>
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isRunning || !file}
        >
          {isRunning && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          )}
          {t('sidebar.import.submit.string')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default memo(ImportAction)
