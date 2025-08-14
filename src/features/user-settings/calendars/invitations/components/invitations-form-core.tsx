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
import SelectForm from '@/components/ui/forms/select-form'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React from 'react'
import { z } from 'zod'
import {
  CalendarInvitationsFormProps,
  InvitationWblistOption,
} from '../calendars-invitations-types'
import { schema } from './invitations-schema'

type FormData = z.infer<typeof schema>

const CalendarInvitationsSettingsForm: React.FC<
  CalendarInvitationsFormProps
> = ({ data, update }) => {
  const t = useTranslations('US_CALENDAR_INVITATIONS')

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data,
  })

  const prevent_invitations = form.watch('prevent_invitations')

  const onSubmit = React.useCallback(
    (values: FormData): void => {
      update(values)
    },
    [update]
  )

  const handleSubmit = React.useCallback(
    (values: FormData): void => {
      onSubmit(values)
    },
    [onSubmit]
  )

  const { isDirty, isSubmitting } = form.formState

  const handleReset = React.useCallback((): void => {
    form.reset()
  }, [form])

  const invitationsWlistOpt = React.useCallback(
    (wbist: string[]): InvitationWblistOption[] =>
      wbist.map((opt) => ({
        value: opt,
        label: opt,
      })),
    []
  )

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <div>
          <FormField
            control={form.control}
            name={'disable_notifications'}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('form.notifications.string')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'prevent_invitations'}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('form.prevent_invitation.string')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
          {prevent_invitations && (
            <FormField
              control={form.control}
              name="invitations_wlist"
              render={({ field }) => (
                <FormItem className="ml-10 items-start space-y-0 space-x-3">
                  <FormLabel>{t('form.whitelist_invitation.string')}</FormLabel>
                  <FormControl>
                    <SelectForm
                      onValueChange={(value) => field.onChange([value])}
                      value={field.value?.[0] ?? ''}
                      options={invitationsWlistOpt(field.value ?? [])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>
        <FixedFormButtonGroup
          onReset={handleReset}
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
        />
      </form>
    </Form>
  )
}

export default CalendarInvitationsSettingsForm
