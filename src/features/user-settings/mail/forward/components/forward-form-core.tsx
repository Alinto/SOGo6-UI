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
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { MailForward } from '../mail-forward-types'
import { useUpdateMailForwardSettingsMutation } from '../store/mail-forward-settings-api'
import ForwardEmailInput from './forward-email-input'
import { schema } from './forward-schema'

interface Props {
  data: MailForward | undefined
  update: ReturnType<typeof useUpdateMailForwardSettingsMutation>[0]
}

function MailForwardSettingsForm({ data, update }: Props) {
  const t = useTranslations('US_MAIL_FORWARD')
  const formT = useTranslations('FORM_COMMONS')

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: data,
    mode: 'onChange',
  })

  const enabled = useWatch({ control: form.control, name: 'enabled' })
  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: 'emails',
  })
  const { isDirty, isSubmitting, errors } = form.formState
  const MAX_EMAILS = 10

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await update(values).unwrap()

      // Reset form with new values (important: sets isDirty to false)
      form.reset(values)
    } catch (error) {
      // Error handling is done by the centralized notification system
      console.error('Failed to save:', error)
    }
  }

  function handleAdd(value: string) {
    if (errors.email || errors.emails) return
    if (fields.length >= MAX_EMAILS) return

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
                      maxTags={MAX_EMAILS}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="alwaysForward"
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

        <FixedFormButtonGroup
          onReset={() => form.reset()}
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
          mode="inline"
          resetLabel={formT('reset.default.string')}
          submitLabel={formT('save.default.string')}
        />
      </form>
    </Form>
  )
}

export default MailForwardSettingsForm
