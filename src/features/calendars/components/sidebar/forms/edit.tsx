'use client'
import { Button } from '@/components/ui/button'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  useDeleteCalendarMutation,
  useUpdateCalendarMutation,
} from '@/features/calendars/store/calendars-api'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { useForm } from 'react-hook-form'
import CalendarFormCore from './calendar-form-core'
import type { CalendarAddFormData } from './calendar-form-types'
import { schema, type CalendarEditFormData } from './edit-schema'

interface EditFormProps {
  id: string
  name: string
  color?: string
  description?: string
  eventDuration?: string
  eventNotifications?: Array<{
    type: 'notification' | 'email'
    timing: string
  }>
  allDayNotifications?: Array<{
    type: 'notification' | 'email'
    daysBefore: number
    time: string
  }>
  showBusyStatus?: boolean
  onClose?: () => void
}

const EditForm: React.FC<EditFormProps> = ({
  id,
  name,
  color,
  description,
  eventDuration,
  eventNotifications,
  allDayNotifications,
  showBusyStatus,
  onClose,
}) => {
  const t = useTranslations('CALENDARS')
  const [updateCalendar, { isLoading }] = useUpdateCalendarMutation()
  const [deleteCalendar, { isLoading: isDeleting }] = useDeleteCalendarMutation()

  const form = useForm<CalendarEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      id,
      name,
      color: color || '#3b82f6',
      description: description || '',
      eventDuration:
        eventDuration ||
        t('forms.editCalendar.durationOptions.thirtyMinutes.string'),
      showBusyStatus: showBusyStatus ?? false,
      eventNotifications: eventNotifications || [],
      allDayNotifications: allDayNotifications || [],
    },
  })

  const handleSubmit = async (values: CalendarEditFormData) => {
    try {
      await updateCalendar({
        key: values.id,
        name: values.name,
        color: values.color,
        description: values.description || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).unwrap()
      onClose?.()
      form.reset(values)
    } catch {
      // Notifications are handled by RTK Query onQueryStarted.
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCalendar(id).unwrap()
      onClose?.()
    } catch {
      // Notifications are handled by RTK Query onQueryStarted.
    }
  }

  const handleCancel = () => {
    onClose?.()
    form.reset()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('forms.editCalendar.title.string')}</DialogTitle>
      </DialogHeader>
      <div className={cn('flex justify-end')}>
        <Button
          type="button"
          variant="destructive"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          {t('forms.deleteCalendar.confirm.string')}
        </Button>
      </div>
      <CalendarFormCore
        form={
          form as unknown as ReturnType<
            typeof useForm<CalendarAddFormData | CalendarEditFormData>
          >
        }
        onSubmit={
          handleSubmit as (
            values: CalendarAddFormData | CalendarEditFormData
          ) => Promise<void>
        }
        onCancel={handleCancel}
        isLoading={isLoading || isDeleting}
        formPrefix="editCalendar"
        showButtons={true}
        isFormDirty={form.formState.isDirty}
      />
    </>
  )
}

export default memo(EditForm)
