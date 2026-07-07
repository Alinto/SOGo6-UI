'use client'

import SortableContainer from '@/components/dnd/sortable-container'
import SortableItem from '@/components/dnd/sortable-item'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import SettingsFormActionBar from '@/features/user-settings/components/settings-form-action-bar'
import { createEmptyFilter } from '@/features/user-settings/mail/filters/mail-filters-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Filter, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import type { MailFilter } from '../mail-filters-types'
import type { useUpdateMailFiltersSettingsMutation } from '../store/mail-filters-settings-api'
import FilterLineForm from './filter-line-form'
import FilterEditDialog from './filter-form'
import { createFiltersSchema, type FiltersFormValues } from './filters-schema'

interface Props {
  data: MailFilter[] | undefined
  accountId: string
  update: ReturnType<typeof useUpdateMailFiltersSettingsMutation>[0]
}

const MailFiltersSettingsForm: React.FC<Props> = ({
  data,
  accountId,
  update,
}) => {
  const t = useTranslations('US_MAIL_FILTERS')
  const formT = useTranslations('FORM_COMMONS')
  const settingsT = useTranslations('US_USER_SETTINGS')
  const schema = useMemo(() => createFiltersSchema(t), [t])
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const form = useForm<FiltersFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { filters: data ?? [] },
  })

  const { reset } = form

  useEffect(() => {
    if (data) {
      reset({ filters: data })
    }
  }, [data, reset])

  const { fields, remove, move, insert, update: updateField } = useFieldArray({
    control: form.control,
    name: 'filters',
    keyName: 'fieldKey',
  })

  const { isDirty, isSubmitting } = form.formState

  async function onSubmit(values: FiltersFormValues) {
    try {
      const saved = await update({
        accountId,
        filters: values.filters,
      }).unwrap()
      form.reset({ filters: saved })
    } catch (error) {
      console.error('Failed to save mail filters:', error)
    }
  }

  function handleSaveFilter(filter: MailFilter, index?: number) {
    if (index !== undefined) {
      updateField(index, filter)
    } else {
      insert(fields.length, filter)
    }
    setEditingIndex(null)
    setIsCreating(false)
  }

  function handleDeleteConfirmed() {
    if (deleteIndex !== null) {
      remove(deleteIndex)
      setDeleteIndex(null)
    }
  }

  const editingFilter =
    editingIndex !== null ? form.getValues(`filters.${editingIndex}`) : undefined

  return (
    <>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {fields.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                  <Filter className="text-muted-foreground h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-medium">
                    {t('empty_state.title.string')}
                  </h3>
                  <p className="text-muted-foreground max-w-sm text-sm">
                    {t('empty_state.description.string')}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('empty_state.add_button.string')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {t('list.section_title.string')}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="size-5 shrink-0 justify-center p-0 font-normal tabular-nums"
                      >
                        {fields.length}
                      </Badge>
                    </div>
                    <CardDescription>
                      {t('list.section_description.string')}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreating(true)}
                    className="shrink-0 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('list.add_filter.string')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                <SortableContainer
                  items={fields.map((field) => field.fieldKey)}
                  setItem={move}
                >
                  {fields.map((field, index) => (
                    <SortableItem key={field.fieldKey} id={field.fieldKey}>
                      <FilterLineForm
                        field={field}
                        control={form.control}
                        index={index}
                        onEdit={() => setEditingIndex(index)}
                        onDelete={() => setDeleteIndex(index)}
                      />
                    </SortableItem>
                  ))}
                </SortableContainer>
              </CardContent>
            </Card>
          )}

          <SettingsFormActionBar
            onReset={() => form.reset({ filters: data ?? [] })}
            disableReset={!isDirty || isSubmitting}
            disableSubmit={!isDirty || isSubmitting}
            visible={isDirty}
            isLoading={isSubmitting}
            hint={settingsT('unsaved_changes.string')}
            resetLabel={formT('reset.default.string')}
            submitLabel={formT('save.default.string')}
          />
        </form>
      </Form>

      <FilterEditDialog
        open={isCreating || editingIndex !== null}
        filter={isCreating ? createEmptyFilter() : editingFilter}
        accountId={accountId}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false)
            setEditingIndex(null)
          }
        }}
        onSave={(filter) =>
          handleSaveFilter(filter, isCreating ? undefined : editingIndex ?? undefined)
        }
      />

      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('list.delete_confirm.title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('list.delete_confirm.description.string')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('list.delete_confirm.cancel.string')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed}>
              {t('list.delete_confirm.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default MailFiltersSettingsForm
