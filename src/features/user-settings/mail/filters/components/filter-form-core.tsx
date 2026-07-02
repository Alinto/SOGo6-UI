'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import SelectForm from '@/components/ui/forms/select-form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { generateFilterId } from '@/features/user-settings/mail/filters/mail-filters-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import type { MailFilter } from '../mail-filters-types'
import FolderSelectField from './folder-select-field'
import { createSingleFilterSchema, defaultFilterValues } from './filter-schema'
import type { SingleFilterFormValues } from './filters-schema'
import {
  actions,
  getActionOption,
  getConditionsForField,
  operators,
  ruleFields,
} from './utils'

interface FilterEditDialogProps {
  open: boolean
  filter?: MailFilter
  accountId: string
  onOpenChange: (open: boolean) => void
  onSave: (filter: MailFilter) => void
}

const FilterEditDialog: React.FC<FilterEditDialogProps> = ({
  open,
  filter,
  accountId,
  onOpenChange,
  onSave,
}) => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('US_MAIL_FILTERS')

  const schema = useMemo(() => createSingleFilterSchema(t), [t])

  const form = useForm<SingleFilterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: filter ?? defaultFilterValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (open) {
      form.reset(filter ?? defaultFilterValues)
    }
  }, [open, filter, form])

  const translatedOperators = useMemo(
    () =>
      operators.map((operator) => ({
        value: operator.value,
        label: t(operator.translateKey),
      })),
    [t]
  )

  const translatedRuleFields = useMemo(
    () =>
      ruleFields.map((field) => ({
        value: field.value,
        label: t(field.translateKey),
      })),
    [t]
  )

  const translatedActions = useMemo(
    () =>
      actions.map((action) => ({
        value: action.value,
        label: t(action.translateKey),
        disabled: action.disabled,
        disabledReasonKey: action.disabledReasonKey,
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
    keyName: 'fieldKey',
  })

  const {
    fields: actionsFields,
    remove: removeAction,
    insert: insertAction,
  } = useFieldArray({
    control: form.control,
    name: 'actions',
    keyName: 'fieldKey',
  })

  const operator = useWatch({ control: form.control, name: 'operator' })
  const filterName = useWatch({ control: form.control, name: 'name' })
  const isReadOnly = Boolean(filter?.readOnly || filter?.advancedStructure)

  function onSubmit(values: SingleFilterFormValues) {
    onSave(values as MailFilter)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {filter?.name
                  ? t('form.edit.string', { name: filterName || filter.name })
                  : t('form.create.string')}
              </DialogTitle>
            </DialogHeader>

            {isReadOnly && (
              <p className="bg-muted text-muted-foreground rounded-md p-3 text-sm">
                {t('advanced_structure_readonly.string')}
              </p>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.filter_name.string')}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>{t('operators.title.string')}</FormLabel>
              <FormField
                control={form.control}
                name="operator"
                render={({ field }) => (
                  <FormItem>
                    <SelectForm
                      onValueChange={field.onChange}
                      value={field.value}
                      options={translatedOperators}
                      disabled={isReadOnly}
                    />
                  </FormItem>
                )}
              />
            </div>

            {operator !== 'ALL' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>{t('conditions.title.string')}</FormLabel>
                  {!isReadOnly && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        insertRule(rulesFields.length, {
                          id: generateFilterId(),
                          field: 'from',
                          condition: 'CONTAINS',
                          value: '',
                        })
                      }
                    >
                      <Plus className="text-primary h-4 w-4" />
                    </Button>
                  )}
                </div>
                {rulesFields.map((rule, index) => {
                  const watchedField = form.watch(`rules.${index}.field`)
                  const conditionOptions = getConditionsForField(
                    watchedField
                  ).map((condition) => ({
                    value: condition.value,
                    label: t(condition.translateKey),
                  }))

                  return (
                    <div key={rule.fieldKey} className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name={`rules.${index}.field`}
                          render={({ field }) => (
                            <FormItem>
                              <SelectForm
                                onValueChange={field.onChange}
                                value={field.value}
                                options={translatedRuleFields}
                                disabled={isReadOnly}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`rules.${index}.condition`}
                          render={({ field }) => (
                            <FormItem>
                              <SelectForm
                                onValueChange={field.onChange}
                                value={field.value}
                                options={conditionOptions}
                                disabled={isReadOnly}
                              />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-start gap-2">
                          <FormField
                            control={form.control}
                            name={`rules.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input {...field} disabled={isReadOnly} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {!isReadOnly && rulesFields.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => removeRule(index)}
                            >
                              <Trash2 className="text-primary h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {watchedField === 'header' && (
                        <FormField
                          control={form.control}
                          name={`rules.${index}.field_value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t('labels.custom_header.string')}
                              </FormLabel>
                              <FormControl>
                                <Input {...field} disabled={isReadOnly} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {index + 1 !== rulesFields.length && <Separator />}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>{t('actions.title.string')}</FormLabel>
                {!isReadOnly && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      insertAction(actionsFields.length, {
                        id: generateFilterId(),
                        action: 'keep',
                        value: '',
                      })
                    }
                  >
                    <Plus className="text-primary h-4 w-4" />
                  </Button>
                )}
              </div>
              {actionsFields.map((actionField, index) => {
                const watchedAction = form.watch(`actions.${index}.action`)
                const actionOption = getActionOption(watchedAction)

                return (
                  <div key={actionField.fieldKey} className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`actions.${index}.action`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <SelectForm
                                onValueChange={field.onChange}
                                value={field.value}
                                options={translatedActions.map((action) => ({
                                  value: action.value,
                                  label: action.label,
                                  disabled: action.disabled,
                                }))}
                                disabled={isReadOnly}
                              />
                              {actionOption?.disabled &&
                                actionOption.disabledReasonKey && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="text-muted-foreground h-4 w-4" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {t(actionOption.disabledReasonKey)}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                            </div>
                          </FormItem>
                        )}
                      />
                      <div className="flex items-start gap-2">
                        {watchedAction === 'move' && (
                          <FormField
                            control={form.control}
                            name={`actions.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1 space-y-2">
                                <FormControl>
                                  <FolderSelectField
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isReadOnly}
                                    accountId={accountId}
                                  />
                                </FormControl>
                                <FormField
                                  control={form.control}
                                  name={`actions.${index}.createIfNotExist`}
                                  render={({ field: checkboxField }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={
                                            checkboxField.value ?? true
                                          }
                                          onCheckedChange={
                                            checkboxField.onChange
                                          }
                                          disabled={isReadOnly}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {t(
                                          'folder_select.create_if_missing.string'
                                        )}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {watchedAction === 'forward' && (
                          <FormField
                            control={form.control}
                            name={`actions.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    disabled={isReadOnly}
                                    placeholder={t(
                                      'placeholders.forward_email.string'
                                    )}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {!isReadOnly && actionsFields.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => removeAction(index)}
                          >
                            <Trash2 className="text-primary h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {index + 1 !== actionsFields.length && <Separator />}
                  </div>
                )
              })}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {formT('cancel.default.string')}
              </Button>
              <Button type="submit">{formT('save.default.string')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default FilterEditDialog
