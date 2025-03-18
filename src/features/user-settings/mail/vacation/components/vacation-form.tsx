'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePickerWithRangeForm } from '@/components/ui/dates/date-range-picker-form'
import HoursRangePickerForm from '@/components/ui/dates/hours-range-picker-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/components/fixed-form-button-group'
import SelectForm from '@/components/ui/forms/components/select-form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { MailVacation } from '../mail-vacation-types'
import { useUpdateMailVacationSettingsMutation } from '../store/mail-vacation-settings-api'
import { schema } from './vacation-schema'

interface Props {
  data: MailVacation | undefined
  update: ReturnType<typeof useUpdateMailVacationSettingsMutation>[0]
}

const MailVacationSettingsForm: React.FC<Props> = ({ data, update }) => {
  const t = useTranslations('Mail_Settings_Vacation')
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: data,
  })

  function onSubmit(values: z.infer<typeof schema>) {
    update(values)
  }
  const enabled = form.watch('enabled')

  const enableDates = form.watch('constraints.enableDates')
  const enableHours = form.watch('constraints.enableHours')
  const enableDays = form.watch('constraints.enableDays')
  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
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
        </div>
        {enabled ? (
          <div className="grid grid-cols-1 gap-4 p-4 shadow border rounded">
            <FormField
              control={form.control}
              name="subject"
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
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auto_reply.message.string')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('auto_reply.message.string')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="emails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auto_reply.message')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('auto_reply.message')} />
                  </FormControl>
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="response.interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auto_reply.interval.label.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      { value: '0', label: '0' },
                      { value: '1', label: '1' },
                      { value: '2', label: '2' },
                      { value: '3', label: '3' },
                      { value: '5', label: '5' },
                      { value: '7', label: '7' },
                      { value: '14', label: '14' },
                      { value: '21', label: '21' },
                      { value: '30', label: '30' },
                    ]}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="response.toMaillingList"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t('auto_reply.response.to_mailling_list.string')}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="response.sendAlways"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
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
            <FormField
              control={form.control}
              name="response.discardMails"
              render={({ field }) => (
                <>
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('auto_reply.response.discard.label.string')}
                      </FormLabel>
                      <FormDescription>
                        {t('auto_reply.response.discard.description.string')}
                      </FormDescription>
                    </div>
                  </FormItem>
                </>
              )}
            />
            <Separator className="my-2" />
            <h3 className="text-lg font-semibold">
              {t('auto_reply.constraints.title.string')}
            </h3>
            <p>
              {t('auto_reply.constraints.description.string', {
                subject: '${subject}',
              })}
            </p>
            <div className="flex justify-start">
              <FormField
                control={form.control}
                name="constraints.enableDates"
                render={({ field }) => (
                  <>
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
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
                  </>
                )}
              />
              {enableDates && (
                <DatePickerWithRangeForm form={form} name="constraints.dates" />
              )}
            </div>
            <div className="flex justify-start">
              <FormField
                control={form.control}
                name="constraints.enableHours"
                render={({ field }) => (
                  <>
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
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
                  </>
                )}
              />
              {enableHours && (
                <HoursRangePickerForm form={form} name="constraints.hour" />
              )}
            </div>
            <FormField
              control={form.control}
              name="constraints.enableDays"
              render={({ field }) => (
                <>
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
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
                </>
              )}
            />
            {enableDays && (
              <FormField
                control={form.control}
                name="constraints.days"
                render={({ field }) => (
                  <>
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                      <FormControl>
                        <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
                          <Button
                            type="button"
                            className={cn(
                              field.value.monday
                                ? 'bg-primary'
                                : 'bg-gray-300 text-muted-foreground'
                            )}
                            onClick={() =>
                              field.onChange({
                                ...field.value,
                                monday: !field.value.monday,
                              })
                            }
                          >
                            {t('auto_reply.constraints.weekdays.monday.string')}
                          </Button>
                          <Button
                            type="button"
                            className={cn(
                              field.value.tuesday
                                ? 'bg-primary'
                                : 'bg-gray-300 text-muted-foreground'
                            )}
                            onClick={() =>
                              field.onChange({
                                ...field.value,
                                tuesday: !field.value.tuesday,
                              })
                            }
                          >
                            {t(
                              'auto_reply.constraints.weekdays.tuesday.string'
                            )}
                          </Button>
                          <Button
                            type="button"
                            className={cn(
                              field.value.wednesday
                                ? 'bg-primary'
                                : 'bg-gray-300 text-muted-foreground'
                            )}
                            onClick={() =>
                              field.onChange({
                                ...field.value,
                                wednesday: !field.value.wednesday,
                              })
                            }
                          >
                            {' '}
                            {t('auto_reply.constraints.weekdays.wednesday')}
                          </Button>
                          <Button
                            type="button"
                            className={cn(
                              field.value.thursday
                                ? 'bg-primary'
                                : 'bg-gray-300 text-muted-foreground'
                            )}
                            onClick={() =>
                              field.onChange({
                                ...field.value,
                                thursday: !field.value.thursday,
                              })
                            }
                          >
                            {t(
                              'auto_reply.constraints.weekdays.thursday.string'
                            )}
                          </Button>
                          <Button
                            type="button"
                            className={cn(
                              field.value.friday
                                ? 'bg-primary'
                                : 'bg-gray-300 text-muted-foreground'
                            )}
                            onClick={() =>
                              field.onChange({
                                ...field.value,
                                friday: !field.value.friday,
                              })
                            }
                          >
                            {' '}
                            {t('auto_reply.constraints.weekdays.friday.string')}
                          </Button>
                          <Button
                            type="button"
                            className={cn(
                              field.value.saturday
                                ? 'bg-primary'
                                : 'bg-gray-300 text-muted-foreground'
                            )}
                            onClick={() =>
                              field.onChange({
                                ...field.value,
                                saturday: !field.value.saturday,
                              })
                            }
                          >
                            {t(
                              'auto_reply.constraints.weekdays.saturday.string'
                            )}
                          </Button>
                          <Button
                            type="button"
                            className={cn(
                              field.value.sunday
                                ? 'bg-primary'
                                : 'bg-gray-300 text-muted-foreground'
                            )}
                            onClick={() =>
                              field.onChange({
                                ...field.value,
                                sunday: !field.value.sunday,
                              })
                            }
                          >
                            {t('auto_reply.constraints.weekdays.sunday.string')}
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  </>
                )}
              />
            )}
          </div>
        ) : null}
        <FixedFormButtonGroup
          onReset={form.reset}
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
        />
      </form>
    </Form>
  )
}

export default MailVacationSettingsForm
