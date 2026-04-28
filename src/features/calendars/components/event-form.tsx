'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type CalendarEvent,
  type CalendarEventCreateBody,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
} from '@/features/calendars'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  title: z.string().min(1),
  start: z.string(),
  end: z.string(),
  all_day: z.boolean(),
  description: z.string().optional(),
  location: z.string().optional(),
  visibility: z.enum(['public', 'private', 'confidential']),
  show_as: z.enum(['busy', 'free']),
  url: z.string().url().optional().or(z.literal('')),
})

type EventFormProps = {
  calendarKey: string
  start?: Date
  end?: Date
  event?: CalendarEvent | null
  onCancel: () => void
}

type EventFormValues = z.infer<typeof formSchema>

const formatInputDate = (date: Date, allDay: boolean) =>
  allDay ? date.toISOString().slice(0, 10) : date.toISOString().slice(0, 16)

const normalizeInputValue = (value: string, allDay: boolean) =>
  allDay ? value.slice(0, 10) : value.length === 10 ? `${value}T00:00` : value

const toIsoDate = (value: string, allDay: boolean) =>
  new Date(allDay ? `${value}T00:00:00` : value).toISOString()

export function EventForm({
  calendarKey,
  start,
  end,
  event,
  onCancel,
}: EventFormProps) {
  const t = useTranslations('CALENDARS')
  const [createCalendarEvent, createState] = useCreateCalendarEventMutation()
  const [updateCalendarEvent, updateState] = useUpdateCalendarEventMutation()
  const eventKey = event?.key ?? event?.id ?? event?.uid
  const isEditing = Boolean(eventKey)
  const isSubmitting = createState.isLoading || updateState.isLoading
  const isAllDay = event?.all_day ?? false
  const startDate = event ? new Date(event.start_date) : (start ?? new Date())
  const endDate = event ? new Date(event.end_date) : (end ?? startDate)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title ?? '',
      start: formatInputDate(startDate, isAllDay),
      end: formatInputDate(endDate, isAllDay),
      all_day: isAllDay,
      description: event?.description ?? '',
      location: event?.location ?? '',
      visibility: event?.visibility ?? 'public',
      show_as: event?.show_as === 'free' ? 'free' : 'busy',
      url: event?.url ?? '',
    },
  })

  const allDay = form.watch('all_day')

  const handleSubmit = async (values: EventFormValues) => {
    const targetCalendarKey = event?.calendar_id ?? calendarKey
    if (!targetCalendarKey) return

    const body: CalendarEventCreateBody = {
      title: values.title,
      date_start: toIsoDate(values.start, values.all_day),
      date_end: toIsoDate(values.end, values.all_day),
      all_day: values.all_day,
      description: values.description || undefined,
      location: values.location || undefined,
      visibility: values.visibility,
      show_as: values.show_as,
      url: values.url || undefined,
    }

    try {
      if (eventKey) {
        await updateCalendarEvent({
          eventKey,
          body,
        }).unwrap()
      } else {
        await createCalendarEvent({
          calendarKey: targetCalendarKey,
          body,
        }).unwrap()
      }
      onCancel()
    } catch {
      // Notifications are handled by RTK Query onQueryStarted.
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('w-full space-y-4 p-4')}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventForm.title.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('eventForm.title.placeholder')}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="all_day"
          render={({ field }) => (
            <FormItem className={cn('flex items-center justify-between gap-4')}>
              <FormLabel>{t('eventForm.allDay.label')}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    form.setValue(
                      'start',
                      normalizeInputValue(form.getValues('start'), checked)
                    )
                    form.setValue(
                      'end',
                      normalizeInputValue(form.getValues('end'), checked)
                    )
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {allDay
                  ? t('eventForm.startDate.label')
                  : t('eventForm.startTime.label')}
              </FormLabel>
              <FormControl>
                <Input type={allDay ? 'date' : 'datetime-local'} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {allDay
                  ? t('eventForm.endDate.label')
                  : t('eventForm.endTime.label')}
              </FormLabel>
              <FormControl>
                <Input type={allDay ? 'date' : 'datetime-local'} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventForm.description.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('eventForm.description.placeholder')}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventForm.location.label')}</FormLabel>
              <FormControl>
                <div className={cn('relative')}>
                  <MapPin
                    className={cn(
                      'text-muted-foreground absolute top-2.5 left-3 h-4 w-4'
                    )}
                  />
                  <Input
                    className={cn('pl-9')}
                    placeholder={t('eventForm.location.placeholder')}
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <div className={cn('grid gap-4 sm:grid-cols-2')}>
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventForm.visibility.label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('eventForm.visibility.placeholder')}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">
                      {t('eventForm.visibility.options.public')}
                    </SelectItem>
                    <SelectItem value="private">
                      {t('eventForm.visibility.options.private')}
                    </SelectItem>
                    <SelectItem value="confidential">
                      {t('eventForm.visibility.options.confidential')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="show_as"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventForm.showAs.label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('eventForm.showAs.placeholder')}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="busy">
                      {t('eventForm.showAs.options.busy')}
                    </SelectItem>
                    <SelectItem value="free">
                      {t('eventForm.showAs.options.free')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventForm.url.label')}</FormLabel>
              <FormControl>
                <div className={cn('relative')}>
                  <Link
                    className={cn(
                      'text-muted-foreground absolute top-2.5 left-3 h-4 w-4'
                    )}
                  />
                  <Input
                    className={cn('pl-9')}
                    type="url"
                    placeholder={t('eventForm.url.placeholder')}
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <div className={cn('flex justify-end space-x-2')}>
          <Button variant="outline" type="button" onClick={onCancel}>
            {t('eventForm.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting || !calendarKey}>
            {isEditing ? t('eventForm.update') : t('eventForm.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default memo(EventForm)
