'use client'
import SortableContainer from '@/components/dnd/sortable-container'
import SortableItem from '@/components/dnd/sortable-item'
import { Form } from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { MailFilter } from '../mail-filters-types'
import { useUpdateMailFiltersSettingsMutation } from '../store/mail-filters-settings-api'
import FilterForm from './filter-form'
import FilterLineForm from './filter-line-form'
import { schema } from './filters-schema'

interface Props {
  data: MailFilter[] | undefined
  update: ReturnType<typeof useUpdateMailFiltersSettingsMutation>[0]
}

const MailFiltersSettingsForm: React.FC<Props> = ({ data, update }) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { filters: data },
  })
  function onSubmit(values: z.infer<typeof schema>) {
    update(values.filters)
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

export default MailFiltersSettingsForm
