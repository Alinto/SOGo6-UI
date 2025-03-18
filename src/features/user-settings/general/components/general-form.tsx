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
import FixedFormButtonGroup from '@/components/ui/forms/components/fixed-form-button-group'
import RadioGroupForm from '@/components/ui/forms/components/radio-group-form'
import SelectForm from '@/components/ui/forms/components/select-form'
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
  const t = useTranslations('General_Settings')

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: data,
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
                    value={field.value}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'fr', label: 'French' },
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
          <div className="grid lg:grid-cols-3 gap-4 lg:space-x-10">
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
                      { value: '01-Fév-25', label: '01-Fév-25' },
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
                        value: 'Samedi, Février 01, 2025',
                        label: 'Samedi, Février 01, 2025',
                      },
                      {
                        value: 'Samedi, 01 Février 2025',
                        label: 'Samedi, 01 Février 2025',
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
          <div className="grid grid-cols-2 gap-4 space-x-10">
            <FormField
              control={form.control}
              name="enableNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t('labels.enable_notifications.string')}
                    </FormLabel>
                    <FormDescription>
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
        <FixedFormButtonGroup
          onReset={form.reset}
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
        />
      </form>
    </Form>
  )
}

export default GeneralSettingsForm
