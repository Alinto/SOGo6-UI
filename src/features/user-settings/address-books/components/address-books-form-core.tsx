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

import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import { Input } from '@/components/ui/input'
import {
  UserContactPreferences,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { AccessibleIcon } from '@radix-ui/react-accessible-icon'
import { Check, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  mapApiToContactGeneralSettings,
  mapContactsSettingsToApi,
} from '../store/address-books-utils'
import { schema } from './address-books-schema'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Props {
  data: UserPreferences | undefined
  update: (data: UserContactPreferences) => void
}

const LabelsForm: React.FC<Props> = ({ data, update }) => {
  const t = useTranslations('US_ADDRESS_BOOKS')

  const fetchedData = data ? mapApiToContactGeneralSettings(data) : undefined

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

  // Predefined colors
  const PREDEFINED_COLORS = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
  ]

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

        <Button
          type="button"
          className="mt-4 mb-4"
          onClick={() => {
            insert(fields.length, {
              name: '',
              color: '',
              canBeTranslated: false,
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            style={{ backgroundColor: field.value }}
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-300 transition-colors hover:border-gray-400 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start">
                          <div className="grid grid-cols-5 gap-2">
                            {PREDEFINED_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => field.onChange(color)}
                                style={{ backgroundColor: color }}
                                className="relative h-8 w-8 rounded-md border-2 border-gray-300 transition-all hover:scale-110 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none"
                              >
                                {field.value === color && (
                                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                                )}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
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
                      <Input {...field} placeholder="Key" type="text" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button onClick={() => remove(i)} size="icon" variant={'ghost'}>
                <AccessibleIcon
                  label={t('accessibility.icon.delete.string', {
                    name: label.name,
                  })}
                >
                  <Trash2 className="text-primary" />
                </AccessibleIcon>
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

export default LabelsForm
