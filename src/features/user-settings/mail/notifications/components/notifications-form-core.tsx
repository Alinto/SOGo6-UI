'use client'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import InputWithError from '@/components/ui/inputs/input-with-error'
import InputWithTags from '@/components/ui/inputs/input-with-tags'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { MailNotifications } from '../mail-notifications-type'
import { useUpdateMailNotificationsSettingsMutation } from '../store/mail-notifications-settings-api'
import { schema } from './notifications-schema'

interface Props {
  data: MailNotifications | undefined
  update: ReturnType<typeof useUpdateMailNotificationsSettingsMutation>[0]
}

const MailNotificationsSettingForm: React.FC<Props> = ({ data, update }) => {
  const t = useTranslations('Mail_Settings_Notifications')
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: data,
    mode: 'onChange',
  })
  function onSubmit(values: z.infer<typeof schema>) {
    update(values)
  }

  const enabled = form.watch('enabled')
  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: 'emails',
  })
  const { isDirty, isSubmitting, errors } = form.formState

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('notifications.enabled.string')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {enabled && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-0 space-x-3 p-4">
                  <FormLabel className="text-muted-foreground">
                    {t('notifications.emails.label.string')}
                  </FormLabel>
                  <FormControl>
                    <InputWithTags
                      name="email"
                      tags={fields}
                      onChange={field.onChange}
                      value={field.value}
                      remove={remove}
                      handleAdd={(value) => {
                        if (errors.email) {
                          return
                        }
                        field.onChange('')
                        insert(fields.length, {
                          value,
                        })
                      }}
                      placeholder={t('notifications.emails.placeholder.string')}
                      errors={errors}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="space-y-0 space-x-3 p-4">
                  <FormLabel className="text-muted-foreground">
                    {t('notifications.message.label.string')}
                  </FormLabel>
                  <FormControl>
                    <InputWithError
                      {...field}
                      placeholder={t(
                        'notifications.message.placeholder.string'
                      )}
                      errors={errors}
                      errorName="message"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}
        <FixedFormButtonGroup
          onReset={form.reset}
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
        />
      </form>
    </Form>
  )
}

export default MailNotificationsSettingForm
