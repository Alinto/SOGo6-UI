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
import RadioGroupForm from '@/components/ui/forms/radio-group-form'
import SelectForm from '@/components/ui/forms/select-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { MailGeneralSettings } from '../mail-general-types'
import type { useUpdateMailGeneralSettingsMutation } from '../store/mail-general-settings-api'
import { schema } from './mail-general-schema'

interface Props {
  data: MailGeneralSettings | undefined
  update: ReturnType<typeof useUpdateMailGeneralSettingsMutation>[0]
}

const MailGeneralSettingsForm: React.FC<Props> = ({ data, update }) => {
  const t = useTranslations('US_MAIL_GENERAL')
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: data,
  })

  function onSubmit(values: z.infer<typeof schema>) {
    update(values)
  }
  const autoMarkAsRead = useWatch({
    control: form.control,
    name: 'autoMarkAsRead',
  }) as boolean
  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <FormField
            control={form.control}
            name="displaySubscribeMailboxesOnly"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('display_subscribed_mailboxes_only.string')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="countAllUnseen"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('fetch_count_of_unseen_messages.string')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="sortByThreads"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('sort_messages_by_threads.string')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="displayFullEmails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('show_recipients_or_sender_full_email.string')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="hideInlineAttachments"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('hide_attachments_for_inline_images.string')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="autoMarkAsRead"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('automatically_mark_messages_as_read.string')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <div className="ml-10 pt-1">
            <FormField
              control={form.control}
              name="autoMarkAsReadDelay"
              render={({ field }) => (
                <FormItem>
                  <RadioGroupForm
                    horizontal
                    onValueChange={field.onChange}
                    disabled={!autoMarkAsRead}
                    value={field.value}
                    options={[
                      {
                        value: '0',
                        label: t('immediately_on_display.string'),
                      },
                      {
                        value: '5',
                        label: t('after_displaying_for_seconds.string'),
                      },
                    ]}
                  />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-4 pl-4">
          <FormField
            control={form.control}
            name="composeOpening"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('compose.title.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    {
                      value: 'ask',
                      label: t('compose.always_ask.string'),
                    },
                    {
                      value: 'window',
                      label: t('compose.in_new_window.string'),
                    },
                    {
                      value: 'webmail',
                      label: t('compose.inside_webmail.string'),
                    },
                  ]}
                />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-4 pl-4">
          <FormField
            control={form.control}
            name="forwardMessages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('forward_messages.title.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    {
                      value: 'inline',
                      label: t('forward_messages.as_inline.string'),
                    },
                    {
                      value: 'asAttachments',
                      label: t('forward_messages.as_attachment.string'),
                    },
                  ]}
                />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-4 pl-4">
          <FormField
            control={form.control}
            name="startReply"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('start_reply.title.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    {
                      value: 'above',
                      label: t('start_reply.to_above.string'),
                    },
                    {
                      value: 'below',
                      label: t('start_reply.to_below.string'),
                    },
                  ]}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="placeSignature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('place_signature.title.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    {
                      value: 'above',
                      label: t('place_signature.above.string'),
                    },
                    {
                      value: 'below',
                      label: t('place_signature.below.string'),
                    },
                  ]}
                />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-4">
          <FormField
            control={form.control}
            name="signOnNew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('sign_on.new.string')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="signOnReply"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('sign_on.reply.string')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="signOnForward"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('sign_on.forward.string')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-4 pl-4">
          <FormField
            control={form.control}
            name="composeIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('start_reply_to.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    { value: 'html', label: 'HTML' },
                    {
                      value: 'plain text',
                      label: 'Plain Text',
                    },
                  ]}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultFontSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('default_font_size.title.string')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    {
                      value: 'sm',
                      label: t('default_font_size.sm.string'),
                    },
                    {
                      value: 'md',
                      label: t('default_font_size.md.string'),
                    },
                    {
                      value: 'lg',
                      label: t('default_font_size.lg.string'),
                    },
                    {
                      value: 'xl',
                      label: t('default_font_size.xl.string'),
                    },
                  ]}
                />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="displayRemoteImages"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('display_remote_images.string')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
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

export default MailGeneralSettingsForm
