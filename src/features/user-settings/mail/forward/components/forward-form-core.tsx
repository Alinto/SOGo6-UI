'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import CheckboxToggle from '@/components/ui/checkbox-toggle'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import SettingsFormActionBar from '@/features/user-settings/components/settings-form-action-bar'
import { MAX_FORWARD_ADDRESSES } from '@/features/user-settings/mail/forward/mail-forward-constants'
import {
  createEmptyForward,
  mapFormValuesToMailForward,
  mapMailForwardToFormValues,
} from '@/features/user-settings/mail/forward/mail-forward-utils'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import type { MailForward } from '../mail-forward-types'
import type { useUpdateMailForwardSettingsMutation } from '../store/mail-forward-settings-api'
import ForwardEmailInput from './forward-email-input'
import {
  createForwardSchema,
  type ForwardFormValues,
} from './forward-schema'

interface Props {
  data: MailForward | undefined
  accountId: string
  update: ReturnType<typeof useUpdateMailForwardSettingsMutation>[0]
}

function MailForwardSettingsForm({ data, accountId, update }: Props) {
  const t = useTranslations('US_MAIL_FORWARD')
  const formT = useTranslations('FORM_COMMONS')
  const settingsT = useTranslations('US_USER_SETTINGS')
  const schema = useMemo(() => createForwardSchema(t), [t])

  const form = useForm<ForwardFormValues>({
    resolver: zodResolver(schema),
    defaultValues: mapMailForwardToFormValues(data ?? createEmptyForward()),
    mode: 'onChange',
  })

  const { reset } = form

  useEffect(() => {
    if (data) {
      reset(mapMailForwardToFormValues(data))
    }
  }, [data, reset])

  const enabled = useWatch({ control: form.control, name: 'enabled' })
  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: 'emails',
  })
  const { isDirty, isSubmitting, errors } = form.formState

  async function onSubmit(values: ForwardFormValues) {
    try {
      const saved = await update({
        accountId,
        forward: mapFormValuesToMailForward(values),
      }).unwrap()
      reset(mapMailForwardToFormValues(saved))
    } catch (error) {
      console.error('Failed to save mail forward settings:', error)
    }
  }

  function handleAdd(value: string) {
    if (errors.email || errors.emails) return
    if (fields.length >= MAX_FORWARD_ADDRESSES) return

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
          aria-labelledby="mail-forward-title"
        >
          <CardHeader className="pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle id="mail-forward-title" className="text-xl">
                  {t('labels.transfer_incoming.string')}
                </CardTitle>
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormControl>
                      <CheckboxToggle
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label={t('aria.toggle_forwarding.string')}
                      />
                    </FormControl>
                  )}
                />
              </div>
              <CardDescription>
                {t('description.transfer_incoming.string')}
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
                    <ForwardEmailInput
                      name="email"
                      tags={fields}
                      value={field.value}
                      onChange={field.onChange}
                      remove={remove}
                      handleAdd={handleAdd}
                      placeholder={t('placeholders.email.string')}
                      errors={errors}
                      disabled={!enabled}
                      maxTags={MAX_FORWARD_ADDRESSES}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="alwaysSend"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!enabled}
                      />
                    </FormControl>
                    <div className="flex items-center gap-2">
                      <FormLabel className="cursor-pointer">
                        {t('labels.always_forward.string')}
                      </FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('tooltip.always_forward.string')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keepCopy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!enabled}
                      />
                    </FormControl>
                    <div className="flex items-center gap-2">
                      <FormLabel className="cursor-pointer">
                        {t('labels.keep_copy.string')}
                      </FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('tooltip.keep_copy.string')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <SettingsFormActionBar
          onReset={() =>
            reset(mapMailForwardToFormValues(data ?? createEmptyForward()))
          }
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

export default MailForwardSettingsForm
