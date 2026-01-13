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
import { useTranslations } from 'next-intl'
import React from 'react'
import { UseFormReturn } from 'react-hook-form'

interface CalendarFormCoreProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (_values: any) => Promise<void> | void
  isLoading?: boolean
  formPrefix: 'editCalendar' | 'createCalendar'
  submitLabel?: string
}

const CalendarFormCore: React.FC<CalendarFormCoreProps> = ({
  form,
  onSubmit,
  isLoading = false,
  formPrefix,
  submitLabel,
}) => {
  const t = useTranslations('CALENDARS')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
          {/* Name and Color Row */}
          <div className="flex gap-4">
            {/* Name Field */}
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

            {/* Color Field */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="mt-6.5 space-y-2">
                  <FormLabel className="block text-sm font-medium">
                    {t(`forms.${formPrefix}.colorLabel.string`)}
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="color-picker"
                        style={{ backgroundColor: field.value }}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-300 p-0 transition-colors hover:border-gray-400"
                      />
                      <input
                        id="color-picker"
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-0 w-0 cursor-pointer"
                        style={{
                          visibility: 'hidden',
                          width: 0,
                          height: 0,
                        }}
                      />
                    </div>
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
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  {t(`forms.${formPrefix}.eventDuration.string`)}
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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
                      {t(`forms.${formPrefix}.durationOptions.oneHour.string`)}
                    </SelectItem>
                    <SelectItem
                      value={t(
                        `forms.${formPrefix}.durationOptions.twoHours.string`
                      )}
                    >
                      {t(`forms.${formPrefix}.durationOptions.twoHours.string`)}
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
            )}
          />

          {/* Event Notifications Section */}
          <div className="space-y-2">
            <FormLabel>
              {t(`forms.${formPrefix}.eventNotifications.string`)}
            </FormLabel>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Select
                  defaultValue={t(`forms.${formPrefix}.notification.string`)}
                >
                  <SelectTrigger className="w-fit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={t(`forms.${formPrefix}.notification.string`)}
                    >
                      {t(`forms.${formPrefix}.notification.string`)}
                    </SelectItem>
                    <SelectItem value={t(`forms.${formPrefix}.email.string`)}>
                      {t(`forms.${formPrefix}.email.string`)}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  defaultValue={t(`forms.${formPrefix}.atTimeOfEvent.string`)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={t(`forms.${formPrefix}.atTimeOfEvent.string`)}
                    >
                      {t(`forms.${formPrefix}.atTimeOfEvent.string`)}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  type="button"
                >
                  {t(`forms.${formPrefix}.delete.string`)}
                </Button>
              </div>
            </div>
            <button className="text-sm text-blue-500 underline" type="button">
              {t(`forms.${formPrefix}.addNotification.string`)}
            </button>
          </div>

          {/* All Day Notifications Section */}
          <div className="space-y-2">
            <FormLabel>
              {t(`forms.${formPrefix}.allDayNotifications.string`)}
            </FormLabel>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Select
                  defaultValue={t(`forms.${formPrefix}.notification.string`)}
                >
                  <SelectTrigger className="w-fit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={t(`forms.${formPrefix}.notification.string`)}
                    >
                      {t(`forms.${formPrefix}.notification.string`)}
                    </SelectItem>
                    <SelectItem value={t(`forms.${formPrefix}.email.string`)}>
                      {t(`forms.${formPrefix}.email.string`)}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormField
                  control={form.control}
                  name="allDayNotificationDaysBefore"
                  render={({ field }) => (
                    <FormItem className="w-16">
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Select
                  defaultValue={t(`forms.${formPrefix}.dayBefore.string`)}
                >
                  <SelectTrigger className="w-fit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={t(`forms.${formPrefix}.dayBefore.string`)}
                    >
                      {t(`forms.${formPrefix}.dayBefore.string`)}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <span>{t(`forms.${formPrefix}.at.string`)}</span>
                <Input type="time" defaultValue="09:00" className="w-32" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  type="button"
                >
                  {t(`forms.${formPrefix}.delete.string`)}
                </Button>
              </div>
            </div>
            <button className="text-sm text-blue-500 underline" type="button">
              {t(`forms.${formPrefix}.addNotification.string`)}
            </button>
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

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button">
            {t(`forms.${formPrefix}.cancel.string`)}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t(`forms.${formPrefix}.saving.string`)
              : submitLabel || t(`forms.${formPrefix}.submit.string`)}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default CalendarFormCore
