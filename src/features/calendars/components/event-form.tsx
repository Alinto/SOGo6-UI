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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  type Calendar,
  type CalendarEvent,
  type CalendarEventCreateBody,
} from '@/features/calendars'
import { cn, tagDismissButtonClassName } from '@/lib/utils'
import {
  formDialogBodyClassName,
  formDialogFooterClassName,
} from '@/lib/utils/form-dialog-layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { skipToken } from '@reduxjs/toolkit/query'
import { Link, Lock, MapPin, Plus, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  useFieldArray,
  useForm,
  useWatch,
  type Resolver,
} from 'react-hook-form'
import * as z from 'zod'
import {
  CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH,
  CALENDAR_EVENT_LOCATION_MAX_LENGTH,
  CALENDAR_EVENT_TITLE_MAX_LENGTH,
} from '../calendar-constants'
import {
  DEFAULT_CALENDAR_COLOR,
  type AttendeeInputItem,
  type CalendarEventUpdateBody,
  type EventRecurrence,
  type EventReminder,
  type FreeBusyRequest,
} from '../calendars-types'
import { useGetFreeBusyQuery } from '../store/calendars-api'
import { isCalendarWritable } from '../utils/is-calendar-writable'
import { recurrenceScopeToMutationFields } from '../utils/recurrence-scope-mutation'
import AttendeeInput from './event-form/attendee-input'
import {
  eventNeedsRecurrenceScope,
  RecurrenceScopeDialog,
  type RecurrenceScope,
} from './recurrence-scope-dialog'
import {
  RecurrenceSelector,
  type RecurrenceRuleValue,
} from './recurrence-selector'
import { TimelineFreeBusy } from './timeline-freebusy'
import { mapBackendFreeBusyToAvailability } from './utils'

const recurrenceFrequencies = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const satisfies readonly RecurrenceRuleValue['frequency'][]

const eventFormFieldsSchema = z.object({
  calendar_key: z.string().min(1),
  title: z.string().min(1).max(CALENDAR_EVENT_TITLE_MAX_LENGTH),
  start: z.string(),
  end: z.string(),
  all_day: z.boolean(),
  timezone: z.string().default('UTC'),
  description: z.string().max(CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH).optional(),
  location: z.string().max(CALENDAR_EVENT_LOCATION_MAX_LENGTH).optional(),
  visibility: z.enum(['public', 'private', 'confidential']),
  show_as: z.enum(['busy', 'free', 'out-of-office', 'tentative']),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).default('confirmed'),
  url: z.string().url().optional().or(z.literal('')),
  categories: z.array(z.string()).default([]),
  reminders: z
    .array(
      z.object({
        method: z.enum(['email', 'popup']),
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

type EventFormTranslator = (key: string) => string

function parseEventFormBound(value: string, allDay: boolean): Date | null {
  if (!value) return null
  const parsed = new Date(allDay ? `${value.slice(0, 10)}T00:00:00` : value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function createEventFormSchema(t: EventFormTranslator) {
  return eventFormFieldsSchema.superRefine((values, ctx) => {
    const start = parseEventFormBound(values.start, values.all_day)
    const end = parseEventFormBound(values.end, values.all_day)
    if (start && end && end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('eventForm.errors.date_order.string'),
        path: ['end'],
      })
    }
  })
}

export type EventFormProps = {
  calendarKey: string
  calendars?: Calendar[]
  start?: Date
  end?: Date
  event?: CalendarEvent | null
  onCancel: () => void
}

type EventFormValues = z.infer<typeof eventFormFieldsSchema>

// format Date to match input value (the input value should be in the user's local timezone)
// not allDay : type="datetime-local" value format YYYY-MM-DDTHH:mm, e.g. "2024-07-01T14:30"
// allDay : type="date" value format yyyy-mm-dd, e.g. "2024-07-01"
function formatInputDate(date: Date, allDay: boolean): string {
  const pad = (n: number) => String(n).padStart(2, '0')

  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

  return allDay
    ? datePart
    : `${datePart}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const normalizeInputValue = (value: string, allDay: boolean) =>
  allDay ? value.slice(0, 10) : value.length === 10 ? `${value}T00:00` : value

const toIsoDate = (value: string, allDay: boolean) =>
  new Date(allDay ? `${value}T00:00:00Z` : value).toISOString()

const normalizeReminderMethod = (method: string): EventReminder['method'] =>
  method === 'notification' ? 'popup' : (method as EventReminder['method'])

function recurrenceToFormRule(
  recurrence: EventRecurrence | null | undefined
): EventFormValues['recurrence_rule'] {
  if (!recurrence) return null
  return {
    frequency: recurrence.frequency,
    interval: recurrence.interval ?? 1,
    until: recurrence.until ?? undefined,
    count: recurrence.count ?? undefined,
    by_day: recurrence.by_day ?? undefined,
    by_month_day: recurrence.by_month_day ?? undefined,
    week_start: 'MO',
  }
}

function calendarRowKey(cal: Calendar): string {
  return (cal.key ?? cal.id ?? '').trim()
}

function calendarMatchesRaw(cal: Calendar, raw: string): boolean {
  const row = calendarRowKey(cal)
  const v = raw.trim()
  if (!row || !v) return false
  return row === v || cal.key === v || cal.id === v
}

/** Value that matches SelectItem values so Radix shows the correct calendar label. */
function resolveCalendarKeyForForm(
  calendars: Calendar[] | undefined,
  event: CalendarEvent | null | undefined,
  fallbackCalendarKey: string
): string {
  const candidates: string[] = []
  const push = (x: string | null | undefined) => {
    const s = typeof x === 'string' ? x.trim() : ''
    if (s.length > 0 && !candidates.includes(s)) candidates.push(s)
  }
  push(event?.calendar_id ?? undefined)
  push(event?.calendar_key ?? undefined)
  push(fallbackCalendarKey)

  if (!calendars?.length) {
    return candidates[0] ?? ''
  }

  for (const raw of candidates) {
    const match = calendars.find((cal) => calendarMatchesRaw(cal, raw))
    if (match) return calendarRowKey(match)
  }

  return candidates[0] ?? ''
}

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
    ? new Date(event.date_start ?? start ?? new Date())
    : (start ?? new Date())
  const endDate = event
    ? new Date(event.date_end ?? end ?? startDate)
    : (end ?? startDate)
  const [categoryInput, setCategoryInput] = useState('')
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false)
  const [pendingFormValues, setPendingFormValues] =
    useState<EventFormValues | null>(null)

  const schema = useMemo(() => createEventFormSchema(t), [t])

  const resolvedCalendarKey = useMemo(
    () => resolveCalendarKeyForForm(calendars, event ?? null, calendarKey),
    [calendars, calendarKey, event]
  )

  const calendarsForSelect = useMemo(() => {
    if (!calendars?.length) return calendars
    const resolved = resolvedCalendarKey
    const idx = calendars.findIndex((cal) => calendarRowKey(cal) === resolved)
    if (idx <= 0) return calendars
    const next = [...calendars]
    const [active] = next.splice(idx, 1)
    return [active, ...next]
  }, [calendars, resolvedCalendarKey])

  const form = useForm<EventFormValues>({
    resolver: zodResolver(schema) as Resolver<EventFormValues>,
    defaultValues: {
      calendar_key: resolvedCalendarKey,
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
      categories: event?.categories ?? [],
      reminders:
        event?.reminders?.map((reminder) => ({
          method: normalizeReminderMethod(reminder.method),
          minutes_before: reminder.minutes_before,
        })) ?? [],
      attendees:
        event?.attendees?.map((attendee) => ({
          email: attendee.email,
          name: attendee.name ?? '',
        })) ?? [],
      recurrence_rule: recurrenceToFormRule(
        event?.recurrence ?? event?.recurrence_rule ?? null
      ),
    },
  })

  useEffect(() => {
    if (isEditing || !calendars?.length) return
    const current = form.getValues('calendar_key')
    const currentCal = calendars.find((cal) => calendarRowKey(cal) === current)
    if (!isCalendarWritable(currentCal)) {
      const firstWritable = calendars.find(isCalendarWritable)
      if (firstWritable) {
        form.setValue('calendar_key', calendarRowKey(firstWritable))
      }
    }
  }, [calendars, form, isEditing])

  const {
    fields: reminderFields,
    append: appendReminder,
    remove: removeReminder,
  } = useFieldArray({ control: form.control, name: 'reminders' })

  const watchedAttendees = useWatch({
    control: form.control,
    name: 'attendees',
    defaultValue: [],
  }) as AttendeeInputItem[]

  const watchedStart = useWatch({ control: form.control, name: 'start' })
  const watchedEnd = useWatch({ control: form.control, name: 'end' })

  const attendeeFetchKey = JSON.stringify(
    (watchedAttendees ?? []).map((a) => ({
      e: (a.email ?? '').trim(),
      n: (a.name ?? '').trim(),
    }))
  )

  const freeBusyQueryArg = useMemo((): FreeBusyRequest | typeof skipToken => {
    if (!watchedStart || !watchedEnd) return skipToken
    const target_uids = (watchedAttendees ?? [])
      .map((a) => (a.email ?? '').trim())
      .filter(Boolean)
    if (!target_uids.length) return skipToken

    const center = new Date(watchedStart)
    const windowStart = new Date(center)
    windowStart.setDate(windowStart.getDate() - 1)
    windowStart.setHours(0, 0, 0, 0)

    const windowEnd = new Date(watchedEnd)
    windowEnd.setDate(windowEnd.getDate() + 1)
    windowEnd.setHours(23, 59, 59, 999)

    return {
      target_uids,
      start: windowStart.toISOString(),
      end: windowEnd.toISOString(),
    }
    // attendeeFetchKey avoids refetch when `attendees` gets a new array reference with same content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendeeFetchKey, watchedStart, watchedEnd])

  const { data: freeBusyData, isFetching: isFreeBusyLoading } =
    useGetFreeBusyQuery(freeBusyQueryArg)

  const teamMembersForFreeBusy = useMemo(
    () =>
      (watchedAttendees ?? []).map((a) => ({
        name: a.name ?? a.email,
        email: a.email,
      })),
    [watchedAttendees]
  )

  const mappedData = useMemo(() => {
    const attendeesRaw = freeBusyData?.data?.attendees
    if (!attendeesRaw) return undefined
    return mapBackendFreeBusyToAvailability(
      attendeesRaw,
      teamMembersForFreeBusy
    )
  }, [freeBusyData, teamMembersForFreeBusy])

  const allDay = form.watch('all_day')
  const watchedCalendarKey = form.watch('calendar_key')

  const prevStartRef = useRef<string>(watchedStart)

  useEffect(() => {
    if (!resolvedCalendarKey) return
    const current = form.getValues('calendar_key')
    if (current === resolvedCalendarKey) return
    form.setValue('calendar_key', resolvedCalendarKey)
  }, [resolvedCalendarKey, form])

  useEffect(() => {
    // When start date changes, update end date to keep the same duration
    // (only if both dates are valid and start actually changed)
    const currentStart = watchedStart
    const prevStart = prevStartRef.current

    if (currentStart && prevStart && currentStart !== prevStart && watchedEnd) {
      const parseLocalDateTime = (value: string) => {
        return new Date(allDay ? `${value}T00:00:00` : `${value}:00`)
      }

      const oldStartDate = parseLocalDateTime(prevStart)
      const newStartDate = parseLocalDateTime(currentStart)
      const endDate = parseLocalDateTime(watchedEnd)

      // Calculate the duration between old start and end
      const duration = endDate.getTime() - oldStartDate.getTime()

      // Apply the same duration to the new end date
      const newEndDate = new Date(newStartDate.getTime() + duration)
      form.setValue('end', formatInputDate(newEndDate, allDay), {
        shouldDirty: true,
      })
    }

    prevStartRef.current = currentStart
  }, [watchedStart, allDay, form, watchedEnd])

  const buildEventBody = (
    values: EventFormValues
  ): CalendarEventCreateBody => ({
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
    categories: values.categories.length > 0 ? values.categories : undefined,
    reminders:
      values.reminders.length > 0
        ? values.reminders.map((reminder) => ({
            method: normalizeReminderMethod(reminder.method),
            minutes_before: reminder.minutes_before,
          }))
        : undefined,
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
  })

  const performSubmit = async (
    values: EventFormValues,
    recurrenceScope?: RecurrenceScope
  ) => {
    const targetCalendarKey = values.calendar_key
    if (!targetCalendarKey) return

    const body = buildEventBody(values)

    try {
      if (eventKey) {
        const updateBody: CalendarEventUpdateBody = { ...body }
        if (recurrenceScope && eventNeedsRecurrenceScope(event)) {
          Object.assign(
            updateBody,
            recurrenceScopeToMutationFields(
              recurrenceScope,
              event?.recurrence_id
            )
          )
        }
        await updateCalendarEvent({
          eventKey,
          body: updateBody,
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

  const handleSubmit = async (values: EventFormValues) => {
    if (isEditing && eventNeedsRecurrenceScope(event)) {
      setPendingFormValues(values)
      setScopeDialogOpen(true)
      return
    }
    await performSubmit(values)
  }

  const handleScopeSelect = async (scope: RecurrenceScope) => {
    setScopeDialogOpen(false)
    const values = pendingFormValues
    setPendingFormValues(null)
    if (!values) return
    await performSubmit(values, scope)
  }

  const handleScopeCancel = () => {
    setScopeDialogOpen(false)
    setPendingFormValues(null)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('flex min-h-0 w-full flex-1 flex-col overflow-hidden')}
      >
        <div className={formDialogBodyClassName}>
          {calendars && calendars.length > 0 ? (
            <FormField
              control={form.control}
              name="calendar_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('eventForm.calendar.label.string')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'eventForm.calendar.placeholder.string'
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(calendarsForSelect ?? calendars).map((cal) => {
                        const calKey = cal.key ?? cal.id ?? ''
                        if (!calKey) return null
                        const writable = isCalendarWritable(cal)
                        return (
                          <SelectItem
                            key={calKey}
                            value={calKey}
                            disabled={!writable}
                          >
                            <span
                              className={cn(
                                'flex items-center gap-2',
                                !writable && 'opacity-60'
                              )}
                            >
                              {!writable && (
                                <Lock
                                  className="h-3 w-3 shrink-0"
                                  aria-label={t(
                                    'sidebar.readOnlyCalendar.string'
                                  )}
                                />
                              )}
                              <span
                                className={cn(
                                  'border-border h-3 w-3 shrink-0 rounded-full border'
                                )}
                                style={{
                                  backgroundColor:
                                    cal.color ?? DEFAULT_CALENDAR_COLOR,
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
                <FormLabel>{t('eventForm.title.label.string')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('eventForm.title.placeholder.string')}
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
              <FormItem
                className={cn('flex items-center justify-between gap-4')}
              >
                <FormLabel>{t('eventForm.allDay.label.string')}</FormLabel>
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
                    ? t('eventForm.startDate.label.string')
                    : t('eventForm.startTime.label.string')}
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    type={allDay ? 'date' : 'datetime-local'}
                    {...field}
                  />
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
                    ? t('eventForm.endDate.label.string')
                    : t('eventForm.endTime.label.string')}
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    type={allDay ? 'date' : 'datetime-local'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventForm.timezone.label.string')}</FormLabel>
                <FormControl>
                  <TimezoneSelect
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <p className={cn('text-muted-foreground text-xs')}>
                  {t('eventForm.timezone.description.string')}
                </p>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventForm.description.label.string')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('eventForm.description.placeholder.string')}
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
                <FormLabel>{t('eventForm.location.label.string')}</FormLabel>
                <FormControl>
                  <div className={cn('relative')}>
                    <MapPin
                      className={cn(
                        'text-muted-foreground absolute top-2.5 left-3 h-4 w-4'
                      )}
                    />
                    <Input
                      className={cn('pl-9')}
                      placeholder={t('eventForm.location.placeholder.string')}
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
                  <FormLabel>
                    {t('eventForm.visibility.label.string')}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'eventForm.visibility.placeholder.string'
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">
                        {t('eventForm.visibility.options.public.string')}
                      </SelectItem>
                      <SelectItem value="private">
                        {t('eventForm.visibility.options.private.string')}
                      </SelectItem>
                      <SelectItem value="confidential">
                        {t('eventForm.visibility.options.confidential.string')}
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
                  <FormLabel>{t('eventForm.showAs.label.string')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('eventForm.showAs.placeholder.string')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="busy">
                        {t('eventForm.showAs.options.busy.string')}
                      </SelectItem>
                      <SelectItem value="free">
                        {t('eventForm.showAs.options.free.string')}
                      </SelectItem>
                      <SelectItem value="out-of-office">
                        {t('eventForm.showAs.options.outOfOffice.string')}
                      </SelectItem>
                      <SelectItem value="tentative">
                        {t('eventForm.showAs.options.tentative.string')}
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
                  <FormLabel>{t('eventForm.status.label.string')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('eventForm.status.placeholder.string')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="confirmed">
                        {t('eventForm.status.options.confirmed.string')}
                      </SelectItem>
                      <SelectItem value="tentative">
                        {t('eventForm.status.options.tentative.string')}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t('eventForm.status.options.cancelled.string')}
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
                <FormLabel>{t('eventForm.url.label.string')}</FormLabel>
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
                      placeholder={t('eventForm.url.placeholder.string')}
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
          {/* Attendees + free/busy */}
          <FormItem>
            <FormLabel>{t('eventForm.attendees.title.string')}</FormLabel>
            <AttendeeInput
              value={watchedAttendees ?? []}
              onChange={(list) =>
                form.setValue('attendees', list, { shouldDirty: true })
              }
              disabled={isSubmitting}
            />
            {(watchedAttendees?.length > 0 || isFreeBusyLoading) && (
              <div className="mt-3">
                <TimelineFreeBusy
                  teamMembers={teamMembersForFreeBusy}
                  data={mappedData}
                  isLoading={isFreeBusyLoading}
                  centerDate={watchedStart ? new Date(watchedStart) : undefined}
                  appointmentDuration={
                    watchedStart && watchedEnd
                      ? Math.max(
                          15,
                          Math.round(
                            (new Date(watchedEnd).getTime() -
                              new Date(watchedStart).getTime()) /
                              60000
                          )
                        )
                      : undefined
                  }
                />
              </div>
            )}
          </FormItem>
          <div className={cn('flex flex-col gap-2')}>
            <div className={cn('flex items-center justify-between')}>
              <span className={cn('text-sm font-medium')}>
                {t('eventForm.reminders.label.string')}
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
                {t('eventForm.reminders.add.string')}
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
                          {t('eventForm.reminders.methods.popup.string')}
                        </SelectItem>
                        <SelectItem value="email">
                          {t('eventForm.reminders.methods.email.string')}
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
                        {t('eventForm.reminders.minutesBefore.string')}
                      </span>
                    </div>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeReminder(index)}
                  aria-label={t('eventForm.reminders.remove.string')}
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
                <FormLabel>{t('eventForm.categories.label.string')}</FormLabel>
                <FormControl>
                  <div
                    className={cn(
                      'flex flex-col',
                      field.value.length > 0 && 'gap-2'
                    )}
                  >
                    {field.value.length > 0 && (
                      <div className={cn('flex flex-wrap gap-1')}>
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
                                  field.value.filter(
                                    (item) => item !== category
                                  )
                                )
                              }
                              className={tagDismissButtonClassName('p-0.5')}
                              aria-label={t(
                                'eventForm.categories.remove.string',
                                {
                                  category,
                                }
                              )}
                            >
                              <X className={cn('h-3 w-3')} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
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
                      placeholder={t('eventForm.categories.placeholder.string')}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className={formDialogFooterClassName}>
          <Button variant="outline" type="button" onClick={onCancel}>
            {t('eventForm.cancel.string')}
          </Button>
          <Button type="submit" disabled={isSubmitting || !watchedCalendarKey}>
            {isEditing
              ? t('eventForm.update.string')
              : t('eventForm.create.string')}
          </Button>
        </div>
      </form>
      <RecurrenceScopeDialog
        open={scopeDialogOpen}
        mode="edit"
        onSelect={handleScopeSelect}
        onCancel={handleScopeCancel}
      />
    </Form>
  )
}

export default memo(EventForm)
