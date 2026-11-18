'use client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'

import { Checkbox } from '@/components/ui/checkbox'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import SelectForm from '@/components/ui/forms/select-form'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { ReminderPicker } from '@/components/ui/reminder-picker'
import { TimePicker } from '@/components/ui/time-picker'
import {
  UserCalendarGeneral,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  apiToCalendarGeneral,
  calendarGeneralToApi,
} from '../../store/calendar-utils'
import { eventState, schema } from './calendar-general-schema'

interface Props {
  data: UserPreferences | undefined
  update: (data: UserCalendarGeneral) => void
}

import { EmailsTagInput } from '@/components/ui/emails-tag-input'

import { MultiSelect } from '@/components/ui/combomultiple'
import { useGetCalendarsQuery } from '@/features/calendars/store/calendars-api'

type CalendarOptionSource = {
  key?: string
  id?: string
  name: string
}

export function calendarDefaultLabel(
  value: string,
  translate: (key: string) => string
) {
  switch (value) {
    case 'SOGO_DEFAULT_CALENDAR':
      return translate('calendarDefault.SOGO_DEFAULT_CALENDAR')
    case 'SOGO_BIRTHDAY_CALENDAR':
      return translate('calendarDefault.SOGO_BIRTHDAY_CALENDAR')
    case 'SOGO_ANNIVERSARY_CALENDAR':
      return translate('calendarDefault.SOGO_ANNIVERSARY_CALENDAR')
    default:
      return value
  }
}

export function buildCalendarDefaultOptions(
  current: string,
  calendars: CalendarOptionSource[] | undefined,
  translate: (key: string) => string
) {
  const options = (calendars ?? [])
    .map((calendar) => ({
      value: calendar.key ?? calendar.id ?? '',
      label: calendar.name,
    }))
    .filter((option) => option.value)
  if (current && !options.some((option) => option.value === current)) {
    options.unshift({
      value: current,
      label: calendarDefaultLabel(current, translate),
    })
  }
  return options
}

const LabelsForm: React.FC<Props> = ({ data, update }) => {
  const t = useTranslations('US_CALENDARS')
  const formT = useTranslations('FORM_COMMONS')
  const { data: calendars } = useGetCalendarsQuery()

  const calendarDaysShowedOptions = useMemo(
    () =>
      (['0', '1', '2', '3', '4', '5', '6'] as const).map((v) => ({
        value: v,
        label: t(`calendarDaysShowed.${v}`),
      })),
    [t]
  )

  const fetchedData = data ? apiToCalendarGeneral(data) : undefined

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: fetchedData,
  })

  const watchNoInvitation = form.watch('noInvitation')

  useEffect(() => {
    if (data) {
      form.reset(apiToCalendarGeneral(data))
    }
  }, [data])

  function onSubmit(values: z.infer<typeof schema>) {
    update(calendarGeneralToApi(values))
  }

  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (err) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('errors submit', err)
          }
        })}
      >
        <div className="grid gap-4 p-4 lg:grid-cols-3 lg:space-x-10">
          <FormField
            control={form.control}
            name="calendarViewFirstDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('calendarViewFirstDay.string')}</FormLabel>
                <SelectForm
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value.toString()}
                  options={[
                    { value: '0', label: t('calendarViewFirstDay.0') },
                    { value: '1', label: t('calendarViewFirstDay.1') },
                    { value: '2', label: t('calendarViewFirstDay.2') },
                    { value: '3', label: t('calendarViewFirstDay.3') },
                    { value: '4', label: t('calendarViewFirstDay.4') },
                    { value: '5', label: t('calendarViewFirstDay.5') },
                    { value: '6', label: t('calendarViewFirstDay.6') },
                  ]}
                />
              </FormItem>
            )}
          />

          <div className="p-4">
            <FormField
              control={form.control}
              name="calendarCreationNotif"
              render={({ field }) => (
                <FormItem className="flex w-full flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="min-w-0 flex-1">
                    <FormLabel className="mb-2 block wrap-break-word">
                      {t('calendarCreationNotif.string')}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-3 lg:space-x-10">
          <FormField
            control={form.control}
            name="workdayStartTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('workdayStartTime.string')}</FormLabel>
                <TimePicker
                  value={{
                    hours: Number(field.value?.split(':')[0]),
                    minutes: Number(field.value?.split(':')[1] ?? 0),
                  }}
                  onChange={(values) =>
                    field.onChange(
                      values.hours.toString().padStart(2, '0') +
                        ':' +
                        values.minutes.toString().padStart(2, '0')
                    )
                  }
                  defaultHours={9}
                  defaultMinutes={0}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="workdayEndTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('workdayEndTime.string')}</FormLabel>
                <TimePicker
                  value={{
                    hours: Number(field.value?.split(':')[0]),
                    minutes: Number(field.value?.split(':')[1] ?? 0),
                  }}
                  onChange={(values) =>
                    field.onChange(
                      values.hours.toString().padStart(2, '0') +
                        ':' +
                        values.minutes.toString().padStart(2, '0')
                    )
                  }
                  defaultHours={9}
                  defaultMinutes={0}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="busyOffHours"
            render={({ field }) => (
              <FormItem className="flex w-full flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="min-w-0 flex-1">
                  <FormLabel className="mb-2 block wrap-break-word">
                    {t('busyOffHours.string')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-3 lg:space-x-10">
          <FormField
            control={form.control}
            name="calendarDaysShowed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('calendarDaysShowed.string')}</FormLabel>
                <MultiSelect
                  options={calendarDaysShowedOptions}
                  selected={field.value.map(String)}
                  onChange={(values) => field.onChange(values.map(Number))}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="calendarWeekNumberFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('calendarWeekNumberFormat.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                  options={[
                    { value: '%U', label: t('calendarWeekNumberFormat.%U') },
                    { value: '%W', label: t('calendarWeekNumberFormat.%W') },
                    { value: '%V', label: t('calendarWeekNumberFormat.%V') },
                  ]}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="calendarDefault"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('calendarDefault.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                  options={buildCalendarDefaultOptions(
                    field.value?.toString() ?? '',
                    calendars,
                    t
                  )}
                />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-3 lg:space-x-10">
          <FormField
            control={form.control}
            name="eventDefaultClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventDefaultClass.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                  options={eventState.map((state) => ({
                    value: state,
                    label: t(`calendarStatus.${state}`),
                  }))}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taskDefaultClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('taskDefaultClass.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                  options={eventState.map((state) => ({
                    value: state,
                    label: t(`calendarStatus.${state}`),
                  }))}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="journalDefaultClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('journalDefaultClass.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                  options={eventState.map((state) => ({
                    value: state,
                    label: t(`calendarStatus.${state}`),
                  }))}
                />
              </FormItem>
            )}
          />
        </div>

        {/* //TODO */}
        <div className="grid gap-4 p-4 lg:grid-cols-3 lg:space-x-10">
          <FormField
            control={form.control}
            name="eventDefaultReminder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('eventDefaultReminder.string')}</FormLabel>
                <ReminderPicker
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taskDefaultReminder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('taskDefaultReminder.string')}</FormLabel>
                <ReminderPicker
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="journalDefaultReminder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('journalDefaultReminder.string')}</FormLabel>
                <ReminderPicker
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 p-4 pb-0 md:grid-cols-2 md:space-x-10">
          <FormField
            control={form.control}
            name="noInvitation"
            render={({ field }) => (
              <FormItem className="flex w-full flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="min-w-0 flex-1">
                  <FormLabel className="mb-2 block wrap-break-word">
                    {t('noInvitation.string')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Email whitelist — rendered when noInvitation is checked */}
        <div className="grid gap-4 p-4 pt-1 pl-14 md:grid-cols-2 md:space-x-10">
          <FormField
            control={form.control}
            name="noInvitationWhitelist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('noInvitationWhitelist.string')}</FormLabel>
                <FormControl>
                  <EmailsTagInput
                    value={field.value}
                    onChange={(emails: string[]) => field.onChange(emails)}
                    maxEmails={20}
                    disabled={!watchNoInvitation}
                  ></EmailsTagInput>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* doNotSendInvitFromDav */}
        <div className="grid gap-4 p-4 md:grid-cols-2 md:space-x-10">
          <FormField
            control={form.control}
            name="doNotSendInvitFromDav"
            render={({ field }) => (
              <FormItem className="flex w-full flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="min-w-0 flex-1">
                  <FormLabel className="mb-2 block wrap-break-word">
                    {t('doNotSendInvitFromDav.string')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="davForceSyncFromClient"
            render={({ field }) => (
              <FormItem className="flex w-full flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="min-w-0 flex-1">
                  <FormLabel className="mb-2 flex items-center gap-1.5 wrap-break-word">
                    {t('davForceSyncFromClient.string')}
                    <HelpTooltip
                      message={t('davForceSyncFromClient.help-tooltip')}
                    />
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6">
          <FixedFormButtonGroup
            onReset={() => form.reset()}
            disableReset={!isDirty || isSubmitting}
            disableSubmit={!isDirty || isSubmitting}
            showLabels
            resetLabel={formT('reset.default.string')}
            submitLabel={formT('save.default.string')}
          />
        </div>
      </form>
    </Form>
  )
}

export default LabelsForm
