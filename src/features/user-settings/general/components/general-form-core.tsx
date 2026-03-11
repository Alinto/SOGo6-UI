'use client'
import { Checkbox } from '@/components/ui/checkbox'
import { TimezoneSelect } from '@/components/ui/dates/timezones'
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
import SelectForm from '@/components/ui/forms/select-form'
import type { UserGeneral } from '@/features/user-settings/store/user-preferences-api-types'
import { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'
import {
  DateFormats,
  MODULES,
  TIMEFORMAT,
} from '@/features/user-settings/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  mapApiToGeneralSettings,
  mapGeneralSettingsToApi,
} from '../store/general-utils'
import { schema } from './general-schema'

interface Props {
  data: UserPreferences | undefined
  update: (data: UserGeneral) => void
}

export function GeneralSettingsForm({ data, update }: Props) {
  const t = useTranslations('US_GENERAL')
  const t_common = useTranslations('COMMON')

  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year_short = String(today.getFullYear()).slice(-2)
  const month_short = today.toLocaleString('en', { month: 'short' })

  const dayName = today.toLocaleString('en', { weekday: 'long' })
  const month_long = today.toLocaleString('en', { month: 'long' })
  const year = today.getFullYear()

  const fetchedData = data ? mapApiToGeneralSettings(data) : undefined

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: fetchedData,
  })

  useEffect(() => {
    if (data) {
      form.reset(mapApiToGeneralSettings(data))
    }
  }, [data])

  function onSubmit(values: z.infer<typeof schema>) {
    update(mapGeneralSettingsToApi(values))
  }

  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (err) =>
          console.log('errors sbmit', err)
        )}
      >
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
                      {
                        value: 'en',
                        label: t_common('language.english'),
                        labelRight: '100%',
                      },
                      {
                        value: 'fr',
                        label: t_common('language.french'),
                        labelRight: '10%',
                      },
                    ]}
                  />
                  <FormMessage />
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
                  <TimezoneSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-[280px]"
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.timezone.string')}
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* <FormField
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
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.timezone.string')}
                  </FormDescription>
                </FormItem>
              )}
            /> */}
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
                      {
                        value: DateFormats.DD_MMM_YY,
                        label: `${day}-${month_short}-${year_short}`,
                      },
                      {
                        value: DateFormats.MM_DD_YY,
                        label: `${month}/${year}/${year}`,
                      },
                      {
                        value: DateFormats.DD_MM_YY,
                        label: `${day}/${month}/${year}`,
                      },
                    ]}
                  />
                  <FormMessage />
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
                        value: DateFormats.FULL_LONG_US,
                        label: `${dayName}, ${month_long} ${day}, ${year}`,
                      },
                      {
                        value: DateFormats.FULL_LONG_EU,
                        label: `${dayName}, ${day} ${month_long} ${year}`,
                      },
                      {
                        value: DateFormats.MMM_DD_YYYY,
                        label: `${month_long} ${day}, ${year}`,
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
                        value: TIMEFORMAT.HOUR_PM,
                        label: '3:02 PM',
                      },
                      {
                        value: TIMEFORMAT.HOUR,
                        label: '15:02',
                      },
                      {
                        value: TIMEFORMAT.HOUR_SECONDS,
                        label: '15:02:00',
                      },
                    ]}
                  />
                  <FormMessage />
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
                      { value: MODULES.MAIL, label: t('labels.mail.string') },
                      {
                        value: MODULES.CALENDAR,
                        label: t('labels.calendar.string'),
                      },
                      {
                        value: MODULES.CONTACTS,
                        label: t('labels.contacts.string'),
                      },
                      { value: MODULES.LAST, label: t('labels.last.string') },
                    ]}
                  />
                  <FormMessage />
                  <FormDescription>
                    {t('descriptions.default_view.string')}
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
                <FormItem className="flex w-full flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="min-w-0 flex-1">
                    <FormLabel className="mb-2 block wrap-break-word">
                      {t('labels.enable_notifications.string')}
                    </FormLabel>
                    <FormMessage />
                    <FormDescription className="wrap-break-word">
                      {t('descriptions.enable_notifications.string')}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarEnabled"
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
                      {t('labels.enable_external_avatar.string')}
                    </FormLabel>
                    <FormMessage />
                    <FormDescription className="wrap-break-word">
                      {t('descriptions.enable_external_avatar.string')}
                    </FormDescription>
                  </div>
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
