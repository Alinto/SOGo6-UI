'use client'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/components/fixed-form-button-group'
import RadioGroupForm from '@/components/ui/forms/components/radio-group-form'
import SelectForm from '@/components/ui/forms/components/select-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { defaultValues, schema } from './mail-general-schema'

const MailGeneralSettings: React.FC = () => {
  const t = useTranslations('Mail_Settings')
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  function onSubmit(values: z.infer<typeof schema>) {
    console.log(values)
  }
  const autoMarkAsRead = form.watch('autoMarkAsRead')
  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <FormField
            control={form.control}
            name="displaySubscribeMailboxesOnly"
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
                    {t('display_subscribed_mailboxes_only')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="EAS"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('EAS')}</FormLabel>
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('fetch_count_of_unseen_messages')}</FormLabel>
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('sort_messages_by_threads')}</FormLabel>
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('show_recipients_or_sender_full_email')}
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('hide_attachments_for_inline_images')}
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('automatically_mark_messages_as_read')}
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
                      { value: '0', label: t('immediately_on_display') },
                      { value: '5', label: t('after_displaying_for_seconds') },
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
                <FormLabel>{t('compose.title')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    { value: 'ask', label: t('compose.always_ask') },
                    { value: 'window', label: t('compose.in_new_window') },
                    {
                      value: 'webmail',
                      label: t('compose.inside_webmail'),
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
                <FormLabel>{t('forward_messages.title')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    { value: 'inline', label: t('forward_messages.as_inline') },
                    {
                      value: 'asAttachments',
                      label: t('forward_messages.as_attachment'),
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
                <FormLabel>{t('start_reply.title')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    { value: 'above', label: t('start_reply.to_above') },
                    {
                      value: 'below',
                      label: t('start_reply.to_below'),
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
                <FormLabel>{t('place_signature.title')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    { value: 'above', label: t('place_signature.above') },
                    {
                      value: 'below',
                      label: t('place_signature.below'),
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('sign_on.new')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="signOnReply"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('sign_on.reply')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="signOnForward"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('sign_on.forward')}</FormLabel>
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
                <FormLabel>{t('start_reply_to')}</FormLabel>
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
                <FormLabel>{t('default_font_size.title')}</FormLabel>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    { value: 'sm', label: t('default_font_size.sm') },
                    {
                      value: 'md',
                      label: t('default_font_size.md'),
                    },
                    {
                      value: 'lg',
                      label: t('default_font_size.lg'),
                    },
                    {
                      value: 'xl',
                      label: t('default_font_size.xl'),
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('display_remote_images')}</FormLabel>
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

export default MailGeneralSettings
