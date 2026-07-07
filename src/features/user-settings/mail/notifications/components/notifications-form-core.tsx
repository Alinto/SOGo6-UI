'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import CheckboxToggle from '@/components/ui/checkbox-toggle'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import InputWithError from '@/components/ui/inputs/input-with-error'
import SettingsFormActionBar from '@/features/user-settings/components/settings-form-action-bar'
import TaggedEmailInput from '@/features/user-settings/components/tagged-email-input'
import { MAX_NOTIFY_ADDRESSES } from '@/features/user-settings/mail/notifications/mail-notifications-constants'
import {
  createEmptyNotification,
  mapFormValuesToMailNotification,
  mapMailNotificationToFormValues,
} from '@/features/user-settings/mail/notifications/mail-notifications-utils'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import type { MailNotification } from '../mail-notifications-type'
import type { useUpdateMailNotificationSettingsMutation } from '../store/mail-notifications-settings-api'
import {
  createNotificationSchema,
  type NotificationFormValues,
} from './notifications-schema'

interface Props {
  data: MailNotification | undefined
  accountId: string
  update: ReturnType<typeof useUpdateMailNotificationSettingsMutation>[0]
}

function MailNotificationsSettingForm({ data, accountId, update }: Props) {
  const t = useTranslations('US_MAIL_NOTIFICATIONS')
  const formT = useTranslations('FORM_COMMONS')
  const schema = useMemo(() => createNotificationSchema(t), [t])

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: mapMailNotificationToFormValues(
      data ?? createEmptyNotification()
    ),
    mode: 'onChange',
  })

  const { reset } = form

  useEffect(() => {
    if (data) {
      reset(mapMailNotificationToFormValues(data))
    }
  }, [data, reset])

  const enabled = useWatch({ control: form.control, name: 'enabled' })
  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: 'emails',
  })
  const { isDirty, isSubmitting, errors } = form.formState

  async function onSubmit(values: NotificationFormValues) {
    try {
      const saved = await update({
        accountId,
        notification: mapFormValuesToMailNotification(values),
      }).unwrap()
      reset(mapMailNotificationToFormValues(saved))
    } catch (error) {
      console.error('Failed to save mail notification settings:', error)
    }
  }

  function handleAdd(value: string) {
    if (errors.email || errors.emails) return
    if (fields.length >= MAX_NOTIFY_ADDRESSES) return

    form.setValue('email', '')
    insert(fields.length, { value })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card
          className={cn(
            'w-full transition-all duration-200',
            enabled
              ? 'border-primary/50 bg-primary/5'
              : 'border-muted bg-muted/30'
          )}
          aria-labelledby="mail-notifications-title"
        >
          <CardHeader className="pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle id="mail-notifications-title" className="text-xl">
                  {t('labels.enabled.string')}
                </CardTitle>
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormControl>
                      <CheckboxToggle
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label={t('aria.toggle_notifications.string')}
                      />
                    </FormControl>
                  )}
                />
              </div>
              <CardDescription>
                {t('description.enabled.string')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent
            className={cn(
              'space-y-4 border-t pt-4 transition-all duration-200',
              enabled
                ? 'border-primary/20'
                : 'border-muted pointer-events-none opacity-60'
            )}
            aria-hidden={!enabled}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <span className="text-sm font-medium">
                    {t('labels.email.string')}
                  </span>
                  <FormDescription className="text-xs">
                    {t('help.email.string')}
                  </FormDescription>
                  <FormControl>
                    <TaggedEmailInput
                      translationNamespace="US_MAIL_NOTIFICATIONS"
                      testId="notifications-email-input"
                      name="email"
                      tags={fields}
                      value={field.value}
                      onChange={field.onChange}
                      remove={remove}
                      handleAdd={handleAdd}
                      placeholder={t('placeholders.email.string')}
                      errors={errors}
                      disabled={!enabled}
                      maxTags={MAX_NOTIFY_ADDRESSES}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('labels.message.string')}
                  </FormLabel>
                  <FormControl>
                    <InputWithError
                      {...field}
                      placeholder={t('placeholders.message.string')}
                      errors={errors}
                      errorName="message"
                      disabled={!enabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <SettingsFormActionBar
          onReset={() =>
            reset(mapMailNotificationToFormValues(data ?? createEmptyNotification()))
          }
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
          resetLabel={formT('reset.default.string')}
          submitLabel={formT('save.default.string')}
          isLoading={isSubmitting}
        />
      </form>
    </Form>
  )
}

export default MailNotificationsSettingForm
