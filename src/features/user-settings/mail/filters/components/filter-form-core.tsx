'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import SelectForm from '@/components/ui/forms/components/select-form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useMemo } from 'react'
import { FieldArrayWithId, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { defaultValues, schema } from './filter-schema'
import { actions, operators, ruleConditions, ruleFields } from './utils'

interface FilterEditFormProps {
  filter?: FieldArrayWithId<{
    enabled: boolean
    id: string
    name: string
    operator: string
    rules: FieldArrayWithId<{
      id: string
      field: string
      field_value: string
      condition: string
      value: string
    }>[]
    actions: FieldArrayWithId<{
      id: string
      action: string
      value: string
    }>[]
  }>
}

const FilterForm: React.FC<FilterEditFormProps> = ({ filter }) => {
  const t = useTranslations('Mail_Settings_Filters')
  const formT = useTranslations('Form')
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: filter || defaultValues,
  })
  function onSubmit(values: z.infer<typeof schema>) {
    console.log(values)
  }

  const translatedOperators = useMemo(
    () =>
      operators.map((operator) => ({
        value: operator.value,
        label: t(operator.translateKey),
      })),
    [t]
  )

  const translatedRuleConditions = useMemo(
    () =>
      ruleConditions.map((operator) => ({
        value: operator.value,
        label: t(operator.translateKey),
      })),
    [t]
  )

  const translatedRuleFields = useMemo(
    () =>
      ruleFields.map((operator) => ({
        value: operator.value,
        label: t(operator.translateKey),
      })),
    [t]
  )

  const translatedActions = useMemo(
    () =>
      actions.map((operator) => ({
        value: operator.value,
        label: t(operator.translateKey),
      })),
    [t]
  )
  const {
    fields: rulesFields,
    remove: removeRule,
    insert: insertRule,
  } = useFieldArray({
    control: form.control,
    name: 'rules',
  })

  const {
    fields: actionsFields,
    remove: removeAction,
    insert: insertAction,
  } = useFieldArray({
    control: form.control,
    name: 'actions',
  })

  const name = form.watch('name')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size={'icon'} variant="outline">
          {filter ? (
            <Edit className="text-primary" />
          ) : (
            <Plus className="text-primary" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen max-w-full overflow-y-auto lg:max-w-7xl">
        <Form {...form}>
          <form className="p-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              {filter ? (
                <DialogTitle>{t('form.edit.string', { name })}</DialogTitle>
              ) : (
                <DialogTitle>{t('form.create.string')}</DialogTitle>
              )}
            </DialogHeader>
            <div className="flex flex-col">
              {t('operators.title.string')}
              <FormField
                control={form.control}
                name="operator"
                render={({ field }) => (
                  <FormItem>
                    <SelectForm
                      onValueChange={field.onChange}
                      value={field.value}
                      options={translatedOperators}
                    />
                  </FormItem>
                )}
              />
            </div>
            <DialogHeader className="py-3">
              <div className="flex">
                <DialogTitle className="my-auto">
                  {t('conditions.title.string')}
                </DialogTitle>
                <Button
                  onClick={() =>
                    insertRule(ruleFields.length, {
                      id: `${ruleFields.length}`,
                      condition: '',
                      field: '',
                      value: '',
                    })
                  }
                  className="ml-3 rounded-full"
                  type="button"
                  size={'icon'}
                  variant="outline"
                >
                  <Plus className="text-primary" />
                </Button>
              </div>
            </DialogHeader>
            {rulesFields.map((rule, i) => (
              <div key={rule.id}>
                <div className="grid grid-cols-3 gap-4 py-3">
                  <FormField
                    control={form.control}
                    name={`rules.${i}.field`}
                    render={({ field }) => (
                      <FormItem>
                        <SelectForm
                          onValueChange={field.onChange}
                          value={field.value}
                          options={translatedRuleFields}
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`rules.${i}.condition`}
                    render={({ field }) => (
                      <FormItem>
                        <SelectForm
                          onValueChange={field.onChange}
                          value={field.value}
                          options={translatedRuleConditions}
                        />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`rules.${i}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="button" size={'icon'} variant="outline">
                      <Trash2
                        className="text-primary"
                        onClick={() => removeRule(i)}
                      />
                    </Button>
                  </div>
                </div>
                {i + 1 !== rulesFields.length && <Separator />}
              </div>
            ))}
            <DialogHeader className="py-3">
              <div className="flex">
                <DialogTitle className="my-auto">
                  {t('actions.title.string')}
                </DialogTitle>
                <Button
                  onClick={() =>
                    insertAction(actionsFields.length, {
                      id: `${actionsFields.length}`,
                      action: '',
                      value: '',
                    })
                  }
                  className="ml-3 rounded-full"
                  type="button"
                  size={'icon'}
                  variant="outline"
                >
                  <Plus className="text-primary" />
                </Button>
              </div>
            </DialogHeader>
            {actionsFields.map((rule, i) => (
              <div key={rule.id}>
                <div className="grid grid-cols-2 gap-4 py-3">
                  <FormField
                    control={form.control}
                    name={`actions.${i}.action`}
                    render={({ field }) => (
                      <FormItem>
                        <SelectForm
                          onValueChange={field.onChange}
                          value={field.value}
                          options={translatedActions}
                        />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`actions.${i}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <SelectForm
                            onValueChange={field.onChange}
                            value={field.value}
                            options={[]}
                          />
                        </FormItem>
                      )}
                    />
                    <Button type="button" size={'icon'} variant="outline">
                      <Trash2
                        className="text-primary"
                        onClick={() => removeAction(i)}
                      />
                    </Button>
                  </div>
                </div>
                {i + 1 !== actionsFields.length && <Separator />}
              </div>
            ))}
            <DialogFooter>
              <Button>{formT('cancel.string')}</Button>
              <Button type="submit">{formT('save.string')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default FilterForm
