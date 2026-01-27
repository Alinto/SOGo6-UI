'use client'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import RadioGroupForm from '@/components/ui/forms/radio-group-form'
import SelectForm from '@/components/ui/forms/select-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { GeneralSettings } from '../general-types'
import { schema } from './general-schema'

interface Props {
  data: GeneralSettings | undefined
  update: (data: GeneralSettings) => void
}

export function GeneralSettingsForm({ data, update }: Props) {
  const t = useTranslations('US_GENERAL')

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      language: data?.language || 'en',
    },
  })

  function onSubmit(values: z.infer<typeof schema>) {
    update(values)
  }

  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 space-y-5">
          <div className="grid grid-cols-2 gap-4 space-x-10">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.language.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value ?? 'en'}
                    options={[
                      { value: 'en', label: 'English' },
                    ]}
                  />
                  <FormDescription>
                    {t('descriptions.language.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.timezone.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      { value: 'Europe/Paris', label: 'Europe/Paris' },
                      { value: 'America/New_York', label: 'America/New_York' },
                    ]}
                  />
                  <FormDescription>
                    {t('descriptions.timezone.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-3 lg:space-x-10">
            <FormField
              control={form.control}
              name="shortDateStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.short_date_style.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      { value: '01-Feb-25', label: '01-Feb-25' },
                      { value: '02/25/25', label: '02/25/25' },
                      { value: '25/02/25', label: '25/02/25' },
                    ]}
                  />
                  <FormDescription>
                    {t('descriptions.short_date_style.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longDateStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.long_date_style.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      {
                        value: 'Saturday, February 01, 2025',
                        label: 'Saturday, February 01, 2025',
                      },
                      {
                        value: 'Saturday, 01 February 2025',
                        label: 'Saturday, 01 February 2025',
                      },
                      {
                        value: 'Feb 01, 2025',
                        label: 'Feb 01, 2025',
                      },
                    ]}
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.long_date_style.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.time_style.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      {
                        value: '3:02 PM',
                        label: '3:02 PM',
                      },
                      {
                        value: '15:02',
                        label: '15:02',
                      },
                      {
                        value: '15:02:00',
                        label: '15:02:00',
                      },
                    ]}
                  />
                  <FormDescription>
                    {t('descriptions.time_style.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 space-x-10">
            <FormField
              control={form.control}
              name="defaultView"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.default_view.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      { value: 'Mail', label: 'Mail' },
                      { value: 'Calendar', label: 'Calendar' },
                      { value: 'Contacts', label: 'Contacts' },
                    ]}
                  />
                  <FormDescription>
                    {t('descriptions.default_view.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refreshFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.refresh_frequency.string')}</FormLabel>
                  <SelectForm
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      { value: 'Every 5 minutes', label: 'Every 5 minutes' },
                      { value: 'Every 10 minutes', label: 'Every 10 minutes' },
                      { value: 'Every 15 minutes', label: 'Every 15 minutes' },
                    ]}
                  />
                  <FormDescription>
                    {t('descriptions.refresh_frequency.string')}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:space-x-10">
            <FormField
              control={form.control}
              name="enableNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 w-full">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex-1 min-w-0">
                    <FormLabel className="wrap-break-word block mb-2">
                      {t('labels.enable_notifications.string')}
                    </FormLabel>
                    <FormDescription className="wrap-break-word">
                      {t('descriptions.enable_notifications.string')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="animationLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.animation_level.string')}</FormLabel>
                  <RadioGroupForm
                    horizontal
                    onValueChange={field.onChange}
                    value={field.value}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'low', label: 'Low' },
                      { value: 'normal', label: 'Normal' },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="mt-6">
          <FixedFormButtonGroup
            onReset={form.reset}
            disableReset={!isDirty || isSubmitting}
            disableSubmit={!isDirty || isSubmitting}
          />
        </div>
      </form>
    </Form>
  )
}

export default GeneralSettingsForm
