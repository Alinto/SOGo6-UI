'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TimezoneSelect } from '@/components/ui/dates/timezones'
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
  type Calendar,
  type CalendarEvent,
  type CalendarEventCreateBody,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
} from '@/features/calendars'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, MapPin, Plus, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { type Resolver, useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  RecurrenceSelector,
  type RecurrenceRuleValue,
} from './recurrence-selector'

const recurrenceFrequencies = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const satisfies readonly RecurrenceRuleValue['frequency'][]

const formSchema = z.object({
  calendar_key: z.string().min(1),
  title: z.string().min(1),
  start: z.string(),
  end: z.string(),
  all_day: z.boolean(),
  timezone: z.string().default('UTC'),
  description: z.string().optional(),
  location: z.string().optional(),
  visibility: z.enum(['public', 'private', 'confidential']),
  show_as: z.enum(['busy', 'free', 'out-of-office', 'tentative']),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).default('confirmed'),
  url: z.string().url().optional().or(z.literal('')),
  color: z.string().optional(),
  categories: z.array(z.string()).default([]),
  reminders: z
    .array(
      z.object({
        method: z.enum(['email', 'popup', 'notification']),
        minutes_before: z.number().min(0).default(15),
      })
    )
    .default([]),
  attendees: z
    .array(
      z.object({
        email: z.string().email().or(z.literal('')),
        name: z.string().optional(),
      })
    )
    .default([]),
  recurrence_rule: z
    .object({
      frequency: z.enum(recurrenceFrequencies),
      interval: z.number().min(1).default(1),
      until: z.string().optional(),
      count: z.number().min(1).optional(),
      by_day: z.array(z.string()).optional(),
      by_month_day: z.array(z.number()).optional(),
      week_start: z.string().default('MO'),
    })
    .nullable()
    .default(null),
})

type EventFormProps = {
  calendarKey: string
  calendars?: Calendar[]
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
  calendars,
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
  const startDate = event
    ? new Date(event.start_date ?? event.date_start ?? start ?? new Date())
    : (start ?? new Date())
  const endDate = event
    ? new Date(event.end_date ?? event.date_end ?? end ?? startDate)
    : (end ?? startDate)
  const [categoryInput, setCategoryInput] = useState('')

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema) as Resolver<EventFormValues>,
    defaultValues: {
      calendar_key: event?.calendar_id ?? calendarKey,
      title: event?.title ?? '',
      start: formatInputDate(startDate, isAllDay),
      end: formatInputDate(endDate, isAllDay),
      all_day: isAllDay,
      timezone:
        event?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      description: event?.description ?? '',
      location: event?.location ?? '',
      visibility: event?.visibility ?? 'public',
      show_as: event?.show_as ?? 'busy',
      status: event?.status ?? 'confirmed',
      url: event?.url ?? '',
      color: event?.color ?? '',
      categories: event?.categories ?? [],
      reminders:
        event?.reminders?.map((reminder) => ({
          method: reminder.method,
          minutes_before: reminder.minutes_before,
        })) ?? [],
      attendees:
        event?.attendees?.map((attendee) => ({
          email: attendee.email,
          name: attendee.name ?? '',
        })) ?? [],
      recurrence_rule: event?.recurrence
        ? {
            frequency: event.recurrence.frequency,
            interval: event.recurrence.interval ?? 1,
            until: event.recurrence.until ?? undefined,
            count: event.recurrence.count ?? undefined,
            by_day: event.recurrence.by_day ?? undefined,
            by_month_day: event.recurrence.by_month_day ?? undefined,
            week_start: 'MO',
          }
        : null,
    },
  })

  const {
    fields: reminderFields,
    append: appendReminder,
    remove: removeReminder,
  } = useFieldArray({ control: form.control, name: 'reminders' })

  const {
    fields: attendeeFields,
    append: appendAttendee,
    remove: removeAttendee,
  } = useFieldArray({ control: form.control, name: 'attendees' })

  const allDay = form.watch('all_day')
  const watchedCalendarKey = form.watch('calendar_key')

  const selectedCalendar = useMemo(
    () =>
      calendars?.find(
        (cal) => (cal.key ?? cal.id) === watchedCalendarKey
      ),
    [calendars, watchedCalendarKey]
  )
  const calendarColor = selectedCalendar?.color ?? '#3B82F6'

  const isFirstCalendarKeyEffect = useRef(true)
  useEffect(() => {
    if (isFirstCalendarKeyEffect.current) {
      isFirstCalendarKeyEffect.current = false
      return
    }
    form.setValue('color', '')
  }, [watchedCalendarKey, form])

  const handleSubmit = async (values: EventFormValues) => {
    const targetCalendarKey = values.calendar_key
    if (!targetCalendarKey) return

    const body: CalendarEventCreateBody = {
      title: values.title,
      date_start: toIsoDate(values.start, values.all_day),
      date_end: toIsoDate(values.end, values.all_day),
      all_day: values.all_day,
      timezone: values.timezone,
      description: values.description || undefined,
      location: values.location || undefined,
      visibility: values.visibility,
      show_as: values.show_as,
      status: values.status,
      url: values.url || undefined,
      color: values.color || calendarColor,
      categories: values.categories.length > 0 ? values.categories : undefined,
      reminders: values.reminders.length > 0 ? values.reminders : undefined,
      attendees:
        values.attendees.filter((attendee) => attendee.email.trim() !== '')
          .length > 0
          ? values.attendees
              .filter((attendee) => attendee.email.trim() !== '')
              .map((attendee) => ({
                email: attendee.email,
                name: attendee.name || undefined,
              }))
          : undefined,
      recurrence_rule: values.recurrence_rule ?? undefined,
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
        className={cn('flex max-h-[calc(90vh-88px)] w-full flex-col')}
      >
        <div className={cn('flex-1 space-y-4 overflow-y-auto px-6 py-4')}>
          {calendars && calendars.length > 0 ? (
            <FormField
              control={form.control}
              name="calendar_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('eventForm.calendar.label')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('eventForm.calendar.placeholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {calendars.map((cal) => {
                        const calKey = cal.key ?? cal.id ?? ''
                        if (!calKey) return null
                        return (
                          <SelectItem key={calKey} value={calKey}>
                            <span
                              className={cn('flex items-center gap-2')}
                            >
                              <span
                                className={cn(
                                  'border-border h-3 w-3 shrink-0 rounded-full border'
                                )}
                                style={{
                                  backgroundColor: cal.color ?? '#3B82F6',
                                }}
                              />
                              {cal.name}
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          ) : null}
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
            name="timezone"
            render={({ field }) => (
              <FormItem>
              <FormLabel>{t('eventForm.timezone.label')}</FormLabel>
              <FormControl>
                <TimezoneSelect
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <p className={cn('text-muted-foreground text-xs')}>
                {t('eventForm.timezone.description')}
              </p>
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
                    <SelectItem value="out-of-office">
                      {t('eventForm.showAs.options.outOfOffice')}
                    </SelectItem>
                    <SelectItem value="tentative">
                      {t('eventForm.showAs.options.tentative')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventForm.status.label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('eventForm.status.placeholder')}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="confirmed">
                      {t('eventForm.status.options.confirmed')}
                    </SelectItem>
                    <SelectItem value="tentative">
                      {t('eventForm.status.options.tentative')}
                    </SelectItem>
                    <SelectItem value="cancelled">
                      {t('eventForm.status.options.cancelled')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventForm.color.label')}</FormLabel>
                <FormControl>
                  <div className={cn('flex items-center gap-2')}>
                    <input
                      type="color"
                      value={field.value || calendarColor}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={cn(
                        'border-input bg-background h-9 w-9 cursor-pointer rounded border p-0.5'
                      )}
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => field.onChange('')}
                      >
                        {t('eventForm.color.reset')}
                      </Button>
                    )}
                  </div>
                </FormControl>
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
          <FormField
            control={form.control}
            name="recurrence_rule"
            render={({ field }) => (
              <FormItem>
              <FormControl>
                <RecurrenceSelector
                  value={field.value ?? null}
                  onChange={field.onChange}
                  eventStart={startDate}
                />
              </FormControl>
            </FormItem>
          )}
          />
          <div className={cn('flex flex-col gap-2')}>
            <div className={cn('flex items-center justify-between')}>
            <span className={cn('text-sm font-medium')}>
              {t('eventForm.attendees.label')}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAttendee({ email: '', name: '' })}
            >
              <Plus className={cn('mr-1 h-3 w-3')} />
              {t('eventForm.attendees.add')}
            </Button>
          </div>

          {attendeeFields.map((field, index) => (
            <div key={field.id} className={cn('flex items-center gap-2')}>
              <FormField
                control={form.control}
                name={`attendees.${index}.email`}
                render={({ field }) => (
                  <Input
                    type="email"
                    placeholder={t('eventForm.attendees.emailPlaceholder')}
                    className={cn('flex-1')}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name={`attendees.${index}.name`}
                render={({ field }) => (
                  <Input
                    placeholder={t('eventForm.attendees.namePlaceholder')}
                    className={cn('w-32')}
                    {...field}
                  />
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAttendee(index)}
                aria-label={t('eventForm.attendees.remove')}
              >
                <Trash2 className={cn('text-destructive h-4 w-4')} />
              </Button>
            </div>
          ))}
          </div>
          <div className={cn('flex flex-col gap-2')}>
            <div className={cn('flex items-center justify-between')}>
            <span className={cn('text-sm font-medium')}>
              {t('eventForm.reminders.label')}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendReminder({ method: 'popup', minutes_before: 15 })
              }
            >
              <Plus className={cn('mr-1 h-3 w-3')} />
              {t('eventForm.reminders.add')}
            </Button>
          </div>

          {reminderFields.map((field, index) => (
            <div key={field.id} className={cn('flex items-center gap-2')}>
              <FormField
                control={form.control}
                name={`reminders.${index}.method`}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn('w-[130px]')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popup">
                        {t('eventForm.reminders.methods.popup')}
                      </SelectItem>
                      <SelectItem value="email">
                        {t('eventForm.reminders.methods.email')}
                      </SelectItem>
                      <SelectItem value="notification">
                        {t('eventForm.reminders.methods.notification')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormField
                control={form.control}
                name={`reminders.${index}.minutes_before`}
                render={({ field }) => (
                  <div className={cn('flex items-center gap-1')}>
                    <Input
                      type="number"
                      min={0}
                      className={cn('w-20')}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <span className={cn('text-muted-foreground text-sm')}>
                      {t('eventForm.reminders.minutesBefore')}
                    </span>
                  </div>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeReminder(index)}
                aria-label={t('eventForm.reminders.remove')}
              >
                <Trash2 className={cn('text-destructive h-4 w-4')} />
              </Button>
            </div>
          ))}
          </div>
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
              <FormLabel>{t('eventForm.categories.label')}</FormLabel>
              <FormControl>
                <div className={cn('flex flex-col gap-2')}>
                  <div className={cn('flex min-h-6 flex-wrap gap-1')}>
                    {field.value.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className={cn('gap-1')}
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() =>
                            field.onChange(
                              field.value.filter((item) => item !== category)
                            )
                          }
                          aria-label={t('eventForm.categories.remove', {
                            category,
                          })}
                        >
                          <X className={cn('h-3 w-3')} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      const category = categoryInput.trim()
                      if (e.key === 'Enter' && category) {
                        e.preventDefault()
                        if (!field.value.includes(category)) {
                          field.onChange([...field.value, category])
                        }
                        setCategoryInput('')
                      }
                    }}
                    placeholder={t('eventForm.categories.placeholder')}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
          />
        </div>
        <div
          className={cn(
            'bg-background flex justify-end gap-2 border-t px-6 py-4'
          )}
        >
          <Button variant="outline" type="button" onClick={onCancel}>
            {t('eventForm.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting || !watchedCalendarKey}>
            {isEditing ? t('eventForm.update') : t('eventForm.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default memo(EventForm)
