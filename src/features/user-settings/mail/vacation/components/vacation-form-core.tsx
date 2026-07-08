'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { DatePickerWithRangeForm } from '@/components/ui/dates/date-range-picker-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import SettingsFormActionBar from '@/features/user-settings/components/settings-form-action-bar'
import { createEmptyVacation } from '@/features/user-settings/mail/vacation/mail-vacation-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { MailVacation } from '../mail-vacation-types'
import type { useUpdateMailVacationSettingsMutation } from '../store/mail-vacation-settings-api'
import VacationTimeRangeField from './vacation-time-range-field'
import VacationWeekdayToggle from './vacation-weekday-toggle'
import {
  createVacationSchema,
  type VacationFormValues,
} from './vacation-schema'

interface Props {
  data: MailVacation | undefined
  accountId: string
  timezone?: string
  vacationAllowResponseAlways: boolean
  update: ReturnType<typeof useUpdateMailVacationSettingsMutation>[0]
}

const MailVacationSettingsForm: React.FC<Props> = ({
  data,
  accountId,
  timezone,
  vacationAllowResponseAlways,
  update,
}) => {
  const t = useTranslations('US_MAIL_VACATIONS')
  const formT = useTranslations('FORM_COMMONS')
  const settingsT = useTranslations('US_USER_SETTINGS')
  const schema = useMemo(
    () => createVacationSchema(t, vacationAllowResponseAlways),
    [t, vacationAllowResponseAlways]
  )

  const form = useForm<VacationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: data ?? createEmptyVacation(),
  })

  const { reset } = form

  useEffect(() => {
    if (data) {
      reset(data)
    }
  }, [data, reset])

  const enabled = useWatch({ control: form.control, name: 'enabled' })
  const constraints = useWatch({ control: form.control, name: 'constraints' })
  const enableDates = constraints?.enableDates ?? false
  const enableHours = constraints?.enableHours ?? false
  const weekdaysEnabled = constraints?.weekdaysEnabled ?? false
  const { isDirty, isSubmitting } = form.formState

  async function onSubmit(values: VacationFormValues) {
    try {
      const saved = await update({
        accountId,
        vacation: values,
        timezone,
      }).unwrap()
      form.reset(saved)
    } catch (error) {
      console.error('Failed to save vacation settings:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 py-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t('auto_reply.enable.string')}</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {enabled ? (
          <div className="grid grid-cols-1 gap-4 rounded-lg border p-4">
            <FormField
              control={form.control}
              name="customSubject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auto_reply.subject.label.string')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('auto_reply.subject.label.string')}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('auto_reply.subject.description.string', {
                      subject: '${subject}',
                    })}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoReplyText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auto_reply.message.string')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder={t('auto_reply.message.string')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="constraints.responseIntervalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auto_reply.response.interval_days.label.string')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={vacationAllowResponseAlways ? 0 : 1}
                      value={field.value ?? ''}
                      onChange={(event) => {
                        const raw = event.target.value
                        field.onChange(raw === '' ? null : Number(raw))
                      }}
                      placeholder={t(
                        'auto_reply.response.interval_days.placeholder.string'
                      )}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('auto_reply.response.interval_days.description.string')}
                  </FormDescription>
                </FormItem>
              )}
            />

            {vacationAllowResponseAlways ? (
              <FormField
                control={form.control}
                name="alwaysSend"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('auto_reply.response.send_always.label.string')}
                      </FormLabel>
                      <FormDescription>
                        {t('auto_reply.response.send_always.description.string')}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            ) : null}

            <Separator />

            <div>
              <h3 className="text-lg font-semibold">
                {t('auto_reply.constraints.title.string')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('auto_reply.constraints.description.string')}
              </p>
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="constraints.enableDates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('auto_reply.constraints.enable.range.string')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {enableDates ? (
                <DatePickerWithRangeForm
                  form={form}
                  name="constraints.dateRange"
                />
              ) : null}
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="constraints.enableHours"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('auto_reply.constraints.enable.hours.string')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {enableHours ? (
                <VacationTimeRangeField control={form.control} />
              ) : null}
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="constraints.weekdaysEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('auto_reply.constraints.enable.days.string')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {weekdaysEnabled ? (
                <VacationWeekdayToggle
                  control={form.control}
                  name="constraints.weekdays"
                />
              ) : null}
            </div>
          </div>
        ) : null}

        <SettingsFormActionBar
          onReset={() => form.reset(data ?? createEmptyVacation())}
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
          visible={isDirty}
          isLoading={isSubmitting}
          hint={settingsT('unsaved_changes.string')}
          resetLabel={formT('reset.default.string')}
          submitLabel={formT('save.default.string')}
        />
      </form>
    </Form>
  )
}

export default MailVacationSettingsForm
