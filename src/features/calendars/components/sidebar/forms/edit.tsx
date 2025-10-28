'use client'
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUpdateCalendarMutation } from '@/features/calendars/store/calendars-api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'
import CalendarFormCore from './calendar-form-core'
import { schema, type CalendarEditFormData } from './edit-schema'

interface EditFormProps {
  id: string
  name: string
  color?: string
}

const EditForm: React.FC<EditFormProps> = ({ id, name, color }) => {
  const t = useTranslations('CALENDARS')
  const [updateCalendar, { isLoading }] = useUpdateCalendarMutation()

  const form = useForm<CalendarEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      id,
      name,
      color: color || '#3b82f6',
      description: '',
      eventDuration: t(
        'forms.editCalendar.durationOptions.thirtyMinutes.string'
      ),
      showBusyStatus: false,
    },
  })

  const handleSubmit = async (values: CalendarEditFormData) => {
    try {
      await updateCalendar(values).unwrap()
    } catch (error) {
      console.error('Failed to update calendar:', error)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('forms.editCalendar.title.string')}</DialogTitle>
      </DialogHeader>
      <CalendarFormCore
        form={form}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        formPrefix="editCalendar"
      />
      <DialogFooter />
    </>
  )
}

export default EditForm
