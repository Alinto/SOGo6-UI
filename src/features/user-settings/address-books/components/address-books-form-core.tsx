'use client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { AccessibleIcon } from '@radix-ui/react-accessible-icon'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AddressBook } from '../address-books-types'
import type { useUpdateAddressBooksSettingsMutation } from '../store/address-books-api'
import { schema } from './address-books-schema'

interface Props {
  data: AddressBook[] | undefined
  update: ReturnType<typeof useUpdateAddressBooksSettingsMutation>[0]
}

const LabelsForm: React.FC<Props> = ({ data, update }) => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('US_ADDRESS_BOOKS')

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { books: data },
  })
  function onSubmit(values: z.infer<typeof schema>) {
    update(values.books)
  }

  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: 'books',
  })

  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          type="button"
          className="mb-4"
          onClick={() => {
            insert(fields.length, {
              id: crypto.randomUUID(),
              label: '',
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
                name={`books.${i}.label`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button onClick={() => remove(i)} size="icon" variant={'ghost'}>
                <AccessibleIcon
                  label={t('accessibility.icon.delete.string', {
                    name: label.label,
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
