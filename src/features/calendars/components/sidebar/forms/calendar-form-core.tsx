'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { cn } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import type {
  CalendarAddFormData,
  CalendarEditFormData,
} from './calendar-form-types'

// Union type
type CalendarFormDataUnion = CalendarAddFormData | CalendarEditFormData

const DEFAULT_CALENDAR_COLOR = '#3b82f6'

interface CalendarFormCoreProps {
  form: UseFormReturn<CalendarFormDataUnion>
  onSubmit: (values: CalendarFormDataUnion) => Promise<void> | void
  onCancel?: () => void
  isLoading?: boolean
  formPrefix: 'editCalendar' | 'createCalendar'
  submitLabel?: string
  showButtons?: boolean
  isFormDirty?: boolean // New prop to control the activation of the button
}

const CalendarFormCore: React.FC<CalendarFormCoreProps> = ({
  form,
  onSubmit,
  onCancel,
  isLoading = false,
  formPrefix,
  submitLabel,
  showButtons = true,
  isFormDirty = true, // Default to true (creation mode)
}) => {
  const t = useTranslations('CALENDARS')

  const [eventNotifications, setEventNotifications] = React.useState<
    Array<{
      type: 'notification' | 'email'
      timing: string
    }>
  >([])

  const [allDayNotifications, setAllDayNotifications] = React.useState<
    Array<{
      type: 'notification' | 'email'
      daysBefore: number
      time: string
    }>
  >([])

  // Disable button condition
  const isSubmitDisabled =
    isLoading ||
    !form.watch('name')?.trim() ||
    (formPrefix === 'editCalendar' && !isFormDirty) // Disabled in edition if nothing has changed

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-1 py-4">
          {/* Name and Color Row */}
          <div className="flex items-center gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-2">
                  <FormLabel>
                    {t(`forms.${formPrefix}.nameLabel.string`)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        `forms.${formPrefix}.namePlaceholder.string`
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="block text-sm font-medium">
                    {t(`forms.${formPrefix}.colorLabel.string`)}
                  </FormLabel>
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
          </div>

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  {t(`forms.${formPrefix}.description.string`)}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      `forms.${formPrefix}.descriptionPlaceholder.string`
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Duration Field */}
          <FormField
            control={form.control}
            name="eventDuration"
            render={({ field }) => {
              const defaultValue = t(
                `forms.${formPrefix}.durationOptions.thirtyMinutes.string`
              )
              const currentValue = field.value || defaultValue
              return (
                <FormItem className="space-y-2">
                  <FormLabel>
                    {t(`forms.${formPrefix}.eventDuration.string`)}
                  </FormLabel>
                  <Select value={currentValue} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={defaultValue} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        value={t(
                          `forms.${formPrefix}.durationOptions.thirtyMinutes.string`
                        )}
                      >
                        {t(
                          `forms.${formPrefix}.durationOptions.thirtyMinutes.string`
                        )}
                      </SelectItem>
                      <SelectItem
                        value={t(
                          `forms.${formPrefix}.durationOptions.oneHour.string`
                        )}
                      >
                        {t(
                          `forms.${formPrefix}.durationOptions.oneHour.string`
                        )}
                      </SelectItem>
                      <SelectItem
                        value={t(
                          `forms.${formPrefix}.durationOptions.twoHours.string`
                        )}
                      >
                        {t(
                          `forms.${formPrefix}.durationOptions.twoHours.string`
                        )}
                      </SelectItem>
                      <SelectItem
                        value={t(
                          `forms.${formPrefix}.durationOptions.allDay.string`
                        )}
                      >
                        {t(`forms.${formPrefix}.durationOptions.allDay.string`)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {/* Event Notifications Section */}
          <div className="space-y-2">
            <FormLabel>
              {t(`forms.${formPrefix}.eventNotifications.string`)}
            </FormLabel>
            <div className="space-y-2">
              {eventNotifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex min-w-0 flex-wrap items-center gap-2"
                >
                  <Select
                    value={notification.type}
                    onValueChange={(value) => {
                      const updated = [...eventNotifications]
                      updated[index].type = value as 'notification' | 'email'
                      setEventNotifications(updated)
                      form.setValue('eventNotifications', updated, {
                        shouldDirty: true,
                      })
                    }}
                  >
                    <SelectTrigger className="w-fit min-w-0 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">
                        {t(`forms.${formPrefix}.notification.string`)
                          .charAt(0)
                          .toUpperCase() +
                          t(`forms.${formPrefix}.notification.string`).slice(1)}
                      </SelectItem>
                      <SelectItem value="email">
                        {t(`forms.${formPrefix}.email.string`)
                          .charAt(0)
                          .toUpperCase() +
                          t(`forms.${formPrefix}.email.string`).slice(1)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={notification.timing}
                    onValueChange={(value) => {
                      const updated = [...eventNotifications]
                      updated[index].timing = value
                      setEventNotifications(updated)
                      form.setValue('eventNotifications', updated, {
                        shouldDirty: true,
                      })
                    }}
                  >
                    <SelectTrigger className="min-w-0 flex-1 sm:min-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="at_time">
                        {t(`forms.${formPrefix}.atTimeOfEvent.string`)}
                      </SelectItem>
                      <SelectItem value="5_min">
                        {t(`forms.${formPrefix}.fiveMinutes.string`)}
                      </SelectItem>
                      <SelectItem value="15_min">
                        {t(`forms.${formPrefix}.fifteenMinutes.string`)}
                      </SelectItem>
                      <SelectItem value="30_min">
                        {t(`forms.${formPrefix}.thirtyMinutesBefore.string`)}
                      </SelectItem>
                      <SelectItem value="1_hour">
                        {t(`forms.${formPrefix}.oneHourBefore.string`)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    type="button"
                    onClick={() => {
                      const updated = eventNotifications.filter(
                        (_, i) => i !== index
                      )
                      setEventNotifications(updated)
                      form.setValue('eventNotifications', updated, {
                        shouldDirty: true,
                      })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              type="button"
              className="h-auto p-0 text-sm text-blue-600 hover:bg-transparent hover:text-blue-700"
              onClick={() => {
                const updated = [
                  ...eventNotifications,
                  { type: 'notification' as const, timing: 'at_time' },
                ]
                setEventNotifications(updated)
                form.setValue('eventNotifications', updated, {
                  shouldDirty: true,
                })
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {t(`forms.${formPrefix}.addNotification.string`)}
            </Button>
          </div>

          {/* All Day Notifications Section */}
          <div className="space-y-2">
            <FormLabel>
              {t(`forms.${formPrefix}.allDayNotifications.string`)}
            </FormLabel>
            <div className="space-y-2">
              {allDayNotifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex min-w-0 flex-wrap items-center gap-2"
                >
                  <Select
                    value={notification.type}
                    onValueChange={(value) => {
                      const updated = [...allDayNotifications]
                      updated[index].type = value as 'notification' | 'email'
                      setAllDayNotifications(updated)
                      form.setValue('allDayNotifications', updated, {
                        shouldDirty: true,
                      })
                    }}
                  >
                    <SelectTrigger className="w-fit min-w-0 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">
                        {t(`forms.${formPrefix}.notification.string`)
                          .charAt(0)
                          .toUpperCase() +
                          t(`forms.${formPrefix}.notification.string`).slice(1)}
                      </SelectItem>
                      <SelectItem value="email">
                        {t(`forms.${formPrefix}.email.string`)
                          .charAt(0)
                          .toUpperCase() +
                          t(`forms.${formPrefix}.email.string`).slice(1)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    className="w-14 shrink-0 text-center"
                    value={notification.daysBefore}
                    onChange={(e) => {
                      const updated = [...allDayNotifications]
                      updated[index].daysBefore = parseInt(e.target.value) || 0
                      setAllDayNotifications(updated)
                      form.setValue('allDayNotifications', updated, {
                        shouldDirty: true,
                      })
                    }}
                  />
                  <span className="shrink-0 text-sm whitespace-nowrap">
                    {t(`forms.${formPrefix}.dayBefore.string`)}
                  </span>
                  <span className="shrink-0 text-sm whitespace-nowrap">
                    {t(`forms.${formPrefix}.at.string`)}
                  </span>
                  <Input
                    type="time"
                    className="w-fit min-w-0 shrink-0"
                    value={notification.time}
                    onChange={(e) => {
                      const updated = [...allDayNotifications]
                      updated[index].time = e.target.value
                      setAllDayNotifications(updated)
                      form.setValue('allDayNotifications', updated, {
                        shouldDirty: true,
                      })
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    type="button"
                    onClick={() => {
                      const updated = allDayNotifications.filter(
                        (_, i) => i !== index
                      )
                      setAllDayNotifications(updated)
                      form.setValue('allDayNotifications', updated, {
                        shouldDirty: true,
                      })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              type="button"
              className="h-auto p-0 text-sm text-blue-600 hover:bg-transparent hover:text-blue-700"
              onClick={() => {
                const updated = [
                  ...allDayNotifications,
                  {
                    type: 'notification' as const,
                    daysBefore: 1,
                    time: '09:00',
                  },
                ]
                setAllDayNotifications(updated)
                form.setValue('allDayNotifications', updated, {
                  shouldDirty: true,
                })
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {t(`forms.${formPrefix}.addNotification.string`)}
            </Button>
          </div>

          {/* Show Busy Status Checkbox */}
          <FormField
            control={form.control}
            name="showBusyStatus"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  {t(`forms.${formPrefix}.showBusyStatus.string`)}
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Conditional buttons */}
        {showButtons && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              {t(`forms.${formPrefix}.cancel.string`)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className={
                isSubmitDisabled ? 'cursor-not-allowed opacity-50' : ''
              }
            >
              {isLoading
                ? t(`forms.${formPrefix}.saving.string`)
                : submitLabel || t(`forms.${formPrefix}.submit.string`)}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}

export default CalendarFormCore
