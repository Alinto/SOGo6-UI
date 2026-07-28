'use client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

import { ColorPicker, DEFAULT_COLORS } from '@/components/ui/color-picker'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import { Input } from '@/components/ui/input'
import {
  UserMailCategory,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { AccessibleIcon } from '@radix-ui/react-accessible-icon'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { z } from 'zod'
import {
  mapApiToMailCategorySettings,
  mapMailCategorySettingsToApi,
} from '../../store/mail-utils'
import { createSchema } from './mail-categories-schema'

interface Props {
  data: UserPreferences | undefined
  update: (data: UserMailCategory) => void
}

const LabelsForm: React.FC<Props> = ({ data, update }) => {
  const t = useTranslations('US_MAIL_CATEGORIES')
  const schema = createSchema(t)

  const fetchedData = data ? mapApiToMailCategorySettings(data) : undefined

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: fetchedData,
  })

  useEffect(() => {
    if (data) {
      form.reset(mapApiToMailCategorySettings(data))
    }
  }, [data])

  function onSubmit(values: z.infer<typeof schema>) {
    update(mapMailCategorySettingsToApi(values))
  }

  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: 'categories',
  })

  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          type="button"
          className="mt-4 mb-4"
          onClick={() => {
            insert(fields.length, {
              name: '',
              color: DEFAULT_COLORS[0],
              isDefault: false,
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
                name={`categories.${i}.color`}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`categories.${i}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        value={
                          label.isDefault
                            ? t(`categories.${label.name}`)
                            : field.value
                        }
                        placeholder="Key"
                        type="text"
                        disabled={label.isDefault}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!label.isDefault && (
                <Button onClick={() => remove(i)} size="icon" variant={'ghost'}>
                  <AccessibleIcon
                    label={t('accessibility.icon.delete.string', {
                      name: label.name,
                    })}
                  >
                    <Trash2 className="text-primary" />
                  </AccessibleIcon>
                </Button>
              )}
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

export default LabelsForm
