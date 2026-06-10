'use client'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUpdateCalendarMutation } from '@/features/calendars/store/calendars-api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { useForm } from 'react-hook-form'
import { DEFAULT_CALENDAR_COLOR } from '@/features/calendars/calendars-types'
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

  const form = useForm<CalendarEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      id,
      name,
      color: color || DEFAULT_CALENDAR_COLOR,
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

  const handleCancel = () => {
    onClose?.()
    form.reset()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('forms.editCalendar.title.string')}</DialogTitle>
      </DialogHeader>
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
        isLoading={isLoading}
        formPrefix="editCalendar"
        showButtons={true}
        isFormDirty={form.formState.isDirty}
      />
    </>
  )
}

export default memo(EditForm)
