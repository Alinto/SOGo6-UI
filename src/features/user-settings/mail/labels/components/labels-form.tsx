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
import FixedFormButtonGroup from '@/components/ui/forms/components/fixed-form-button-group'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { MailLabel } from '../mail-labels-types'
import type { useUpdateMailLabelsSettingsMutation } from '../store/mail-labels-settings-api'
import { schema } from './labels-schema'

interface Props {
  data: MailLabel[] | undefined
  update: ReturnType<typeof useUpdateMailLabelsSettingsMutation>[0]
}

const MailLabelsSettingsForm: React.FC<Props> = ({ data, update }) => {
  const t = useTranslations('Mail_Settings_Labels')
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { labels: data },
  })
  function onSubmit(values: z.infer<typeof schema>) {
    update(values)
  }

  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: 'labels',
  })

  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          className="mb-4"
          onClick={() => {
            insert(fields.length, {
              id: crypto.randomUUID(),
              color: '',
              label: '',
              IMAPLabel: '',
            })
          }}
        >
          {t('create.string')}
        </Button>
        <div className="grid gap-4 lg:grid-cols-2">
          {fields.map((label, i) => (
            <div key={label.id} className="flex items-center gap-4">
              <FormField
                control={form.control}
                name={`labels.${i}.color`}
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
                name={`labels.${i}.label`}
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
                name={`labels.${i}.IMAPLabel`}
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
                onClick={() => remove(i)}
                className="mt-8"
                size="icon"
                variant={'ghost'}
              >
                <Trash2 className="text-primary" />
              </Button>
            </div>
          ))}
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

export default MailLabelsSettingsForm
