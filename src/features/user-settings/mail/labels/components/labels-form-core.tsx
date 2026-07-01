'use client'
import { Button } from '@/components/ui/button'
import ColorContainer from '@/components/ui/color-picker/color-container'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { createClientId } from '@/lib/utils/create-client-id'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { MailLabel } from '../mail-labels-types'
import type { useUpdateMailLabelsSettingsMutation } from '../store/mail-labels-settings-api'
import { schema } from './labels-schema'

type FormData = z.infer<typeof schema>
interface Props {
  data: MailLabel[] | undefined
  update: ReturnType<typeof useUpdateMailLabelsSettingsMutation>[0]
}

type MailLabelsSettingsFormProps = Props

const MailLabelsSettingsForm: React.FC<MailLabelsSettingsFormProps> = ({
  data,
  update,
}) => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('US_MAIL_LABELS')
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { labels: data ?? [] },
  })

  const onSubmit = React.useCallback(
    (values: FormData): void => {
      update(values)
    },
    [update]
  )

  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: 'labels',
  })

  const { isDirty, isSubmitting } = form.formState

  const handleAddLabel = React.useCallback((): void => {
    const newLabel: MailLabel = {
      id: createClientId(),
      color: '',
      label: '',
      IMAPLabel: '',
    }
    insert(fields.length, newLabel)
  }, [fields.length, insert])

  const handleRemoveLabel = React.useCallback(
    (index: number): void => {
      remove(index)
    },
    [remove]
  )

  const handleReset = React.useCallback((): void => {
    form.reset()
  }, [form])

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Button type="button" className="mb-4" onClick={handleAddLabel}>
          {formT('create.default.string')}
        </Button>
        <div className="grid gap-4 lg:grid-cols-2">
          {fields.map((label, i) => {
            const fieldKey = `labels.${i}` as const
            return (
              <div key={label.id} className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name={`${fieldKey}.color`}
                  render={({ field }) => (
                    <ColorContainer
                      className={`mt-8`}
                      initialColor={field.value}
                      onColorChange={field.onChange}
                      containerId={`color-container-${i}`}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${fieldKey}.label`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t('label.string')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${fieldKey}.IMAPLabel`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t('imap_label.string')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveLabel(i)}
                  className="mt-8"
                  size="icon"
                  variant={'ghost'}
                  aria-label={`Remove label ${label.label || 'at position ' + (i + 1)}`}
                >
                  <Trash2 className="text-primary" />
                </Button>
              </div>
            )
          })}
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

export default MailLabelsSettingsForm
