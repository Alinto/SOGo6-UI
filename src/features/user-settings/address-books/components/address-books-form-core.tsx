'use client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { ColorPicker } from '@/components/ui/color-picker'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import { Input } from '@/components/ui/input'
import {
  UserContactPreferences,
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
  mapApiToContactGeneralSettings,
  mapContactsSettingsToApi,
} from '../store/address-books-utils'
import { createSchema } from './address-books-schema'

interface Props {
  data: UserPreferences | undefined
  update: (data: UserContactPreferences) => void
}

const LabelsForm: React.FC<Props> = ({ data, update }) => {
  const t = useTranslations('US_ADDRESS_BOOKS')

  const fetchedData = data ? mapApiToContactGeneralSettings(data) : undefined
  const schema = createSchema(t)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: fetchedData,
  })

  useEffect(() => {
    if (data) {
      form.reset(mapApiToContactGeneralSettings(data))
    }
  }, [data])

  function onSubmit(values: z.infer<typeof schema>) {
    update(mapContactsSettingsToApi(values))
  }

  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: 'categories',
  })

  const { isDirty, isSubmitting } = form.formState

  const { control, register, handleSubmit } = form

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2 md:space-x-10">
          <div className="flex w-full flex-row items-start space-y-0 space-x-3">
            <input type="checkbox" {...register('creationNotification')} />
            <div className="min-w-0 flex-1">
              <FormLabel className="mb-2 block wrap-break-word">
                {t('notification.title')}
              </FormLabel>
              <FormMessage />
              <FormDescription className="wrap-break-word">
                {t('notification.string')}
              </FormDescription>
            </div>
          </div>
        </div>
        <br />
        <h2 className="text-2xl">{t('categories.title')}</h2>
        <Button
          type="button"
          className="mt-4 mb-4"
          onClick={() => {
            insert(fields.length, {
              name: '',
              color: '',
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
