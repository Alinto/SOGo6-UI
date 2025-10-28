'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SidebarGroupAction } from '@/components/ui/sidebar'
import { useCreateCalendarMutation } from '@/features/calendars/store/calendars-api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'
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
      color: '#3b82f6',
      description: '',
      eventDuration: t('forms.createCalendar.defaultEventDuration.string'),
      showBusyStatus: false,
    },
  })

  const handleSubmit = async (values: CalendarAddFormData) => {
    try {
      await createCalendar(values).unwrap()
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Failed to create calendar:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction title={t('sidebar.add.string')}>
          <Plus />
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent className="scrollbar-thin-gray max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('forms.createCalendar.title.string')}</DialogTitle>
        </DialogHeader>
        <CalendarFormCore
          form={form}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          formPrefix="createCalendar"
        />
        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setOpen(false)
              form.reset()
            }}
          >
            {t('forms.createCalendar.cancel.string')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {t('forms.createCalendar.submit.string')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddCalendar
