'use client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/components/fixed-form-button-group'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { AccessibleIcon } from '@radix-ui/react-accessible-icon'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { defaultValues, schema } from './address-books-schema'

const LabelsForm: React.FC = () => {
  const t = useTranslations('Address_Books_Settings')
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  function onSubmit(values: z.infer<typeof schema>) {
    console.log(values)
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
          {t('create')}
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
                  label={t('accessibility.icon.delete', { name: label.label })}
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
