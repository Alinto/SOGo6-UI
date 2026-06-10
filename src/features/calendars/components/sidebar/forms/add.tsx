'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SidebarGroupAction } from '@/components/ui/sidebar'
import { useCreateCalendarMutation } from '@/features/calendars/store/calendars-api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { useForm } from 'react-hook-form'
import { DEFAULT_CALENDAR_COLOR } from '@/features/calendars/calendars-types'
import { schema, type CalendarAddFormData } from './add-schema'
import CalendarFormCore from './calendar-form-core'

interface AddCalendarProps {
  type?: 'personals' | 'subscriptions'
}

const AddCalendar: React.FC<AddCalendarProps> = () => {
  const t = useTranslations('CALENDARS')
  const [open, setOpen] = React.useState(false)
  const [createCalendar, { isLoading }] = useCreateCalendarMutation()

  const form = useForm<CalendarAddFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      color: DEFAULT_CALENDAR_COLOR,
      description: '',
    },
  })

  const handleSubmit = async (values: CalendarAddFormData) => {
    try {
      await createCalendar({
        name: values.name,
        color: values.color,
        description: values.description || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).unwrap()
      setOpen(false)
      form.reset()
    } catch {
      // Notifications are handled by RTK Query onQueryStarted.
    }
  }

  const handleCancel = () => {
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction title={t('sidebar.add.string')}>
          <Plus />
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent className="scrollbar-thin-gray max-w-[calc(100vw-2rem)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('forms.createCalendar.title.string')}</DialogTitle>
        </DialogHeader>
        <CalendarFormCore
          form={
            form as unknown as ReturnType<
              typeof useForm<
                | CalendarAddFormData
                | import('./calendar-form-types').CalendarEditFormData
              >
            >
          }
          onSubmit={
            handleSubmit as (
              values:
                | CalendarAddFormData
                | import('./calendar-form-types').CalendarEditFormData
            ) => Promise<void>
          }
          onCancel={handleCancel}
          isLoading={isLoading}
          formPrefix="createCalendar"
          showButtons={true}
        />
      </DialogContent>
    </Dialog>
  )
}

export default memo(AddCalendar)
