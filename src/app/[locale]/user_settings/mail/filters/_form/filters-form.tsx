'use client'
import SortableContainer from '@/components/dnd/sortable-container'
import SortableItem from '@/components/dnd/sortable-item'
import { Form } from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/components/fixed-form-button-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import FilterForm from './filter-form'
import FilterLineForm from './filter-line-form'
import { defaultValues, schema } from './filters-schema'

const FiltersForm: React.FC = () => {
  const t = useTranslations('Mail_Settings_Filters')
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  function onSubmit(values: z.infer<typeof schema>) {
    console.log(values)
  }

  const { fields, remove, move } = useFieldArray({
    control: form.control,
    name: 'filters',
  })

  const { isDirty, isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FilterForm />
        <SortableContainer
          items={fields.map((field) => field.id)}
          setItem={move}
        >
          {fields.map((field, i) => (
            <SortableItem key={field.id} id={field.id}>
              <FilterLineForm
                field={field}
                control={form.control}
                index={i}
                remove={remove}
              />
            </SortableItem>
          ))}
        </SortableContainer>
        <FixedFormButtonGroup
          onReset={form.reset}
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
        />
      </form>
    </Form>
  )
}

export default FiltersForm
