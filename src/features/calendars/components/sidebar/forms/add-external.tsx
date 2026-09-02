'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SidebarGroupAction } from '@/components/ui/sidebar'
import { DEFAULT_CALENDAR_COLOR } from '@/features/calendars/calendars-types'
import { useCreateExternalCalendarMutation } from '@/features/calendars/store/calendars-api'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const SYNC_OPTION_VALUES = [5, 15, 30, 60, 360, 1440] as const

const addExternalSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  color: z.string().optional().nullable(),
  sync_interval_minutes: z.coerce.number().int().min(5).max(1440).optional(),
})

type AddExternalFormData = z.infer<typeof addExternalSchema>

const AddExternalCalendar: React.FC = () => {
  const t = useTranslations('CALENDARS')
  const [open, setOpen] = React.useState(false)
  const [createExternalCalendar, { isLoading }] =
    useCreateExternalCalendarMutation()

  const form = useForm<AddExternalFormData>({
    resolver: zodResolver(addExternalSchema),
    defaultValues: {
      name: '',
      url: '',
      color: DEFAULT_CALENDAR_COLOR,
      sync_interval_minutes: 60,
    },
  })

  const handleSubmit = async (values: AddExternalFormData) => {
    try {
      await createExternalCalendar({
        name: values.name,
        url: values.url,
        color: values.color ?? DEFAULT_CALENDAR_COLOR,
        sync_interval_minutes: values.sync_interval_minutes ?? 60,
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
        <SidebarGroupAction title={t('external.add_title.string')}>
          <Plus />
          <span className="sr-only">{t('external.add_title.string')}</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent className="scrollbar-thin-gray max-w-[calc(100vw-2rem)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('external.add_title.string')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('external.name_label.string')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t('external.url_label.string')}</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} />
                  </FormControl>
                  {fieldState.error ? (
                    <p className="text-destructive text-sm font-medium">
                      {t('external.url_error.string')}
                    </p>
                  ) : null}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('external.color_label.string')}</FormLabel>
                  <FormControl>
                    <input
                      type="color"
                      value={field.value || DEFAULT_CALENDAR_COLOR}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={cn(
                        'border-input bg-background h-9 w-9 cursor-pointer rounded border p-0.5'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sync_interval_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('external.sync_interval_label.string')}
                  </FormLabel>
                  <Select
                    value={String(field.value ?? 60)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SYNC_OPTION_VALUES.map((value) => (
                        <SelectItem key={value} value={String(value)}>
                          {t(`external.sync_interval_options.${value}.string`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={handleCancel}>
                {t('common.cancel.string')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t('forms.createCalendar.saving.string')
                  : t('external.submit.string')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default memo(AddExternalCalendar)
