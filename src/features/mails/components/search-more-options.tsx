import { Checkbox } from '@/components/ui/checkbox'
import { MultiSelect } from '@/components/ui/combomultiple'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import RadioGroupForm from '@/components/ui/forms/radio-group-form'
import SelectForm from '@/components/ui/forms/select-form'
import { Input } from '@/components/ui/input'
import RecipientAutocompleteField from '@/features/address_books/components/recipient-autocomplete-field'
import { useTranslations } from 'next-intl'
import React, { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useMailCategoryPicker } from '../hooks/use-mail-category-picker'
import {
  dateRangePresets,
  type SearchFormValues,
} from '../utils/mail-search-form'

const SIZE_UNIT_OPTIONS = [
  { value: 'kb', label: 'KB' },
  { value: 'mb', label: 'MB' },
  { value: 'gb', label: 'GB' },
]

const ATTACHMENT_TYPE_OPTIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'jpg',
  'png',
  'gif',
  'zip',
  'txt',
  'csv',
].map((extension) => ({ value: extension, label: extension.toUpperCase() }))

interface SearchMoreOptionsProps {
  form: UseFormReturn<SearchFormValues>
  open: boolean
}

const SearchMoreOptions: React.FC<SearchMoreOptionsProps> = ({
  form,
  open,
}) => {
  const t = useTranslations('MAILS_COMMONS')
  const { allCategories } = useMailCategoryPicker(open)
  const loadingLabel = t('recipient_search.loading.string')
  const getAddDirectLabel = (email: string) =>
    t('recipient_search.add_direct.string', { email })

  const makeRecipientFieldHandlers = (
    value: string[],
    onChange: (next: string[]) => void
  ) => ({
    tags: value.map((email) => ({ id: email, value: email })),
    remove: (index: number) => {
      onChange(value.filter((_, i) => i !== index))
    },
    handleAdd: (rawValue: string) => {
      // Search values don't have to be full email addresses — a partial
      // address or a name is a valid filter — so only trim/dedupe here.
      const trimmed = rawValue.trim()
      if (!trimmed) return
      if (value.some((entry) => entry.toLowerCase() === trimmed.toLowerCase()))
        return
      onChange([...value, trimmed])
    },
  })
  const dateRangePreset = form.watch('dateRangePreset')
  const hasAttachment = form.watch('hasAttachment')
  const sizeOperator = form.watch('sizeOperator')

  const sizeOperatorOptions = [
    { value: 'any', label: t('search.size.any.string') },
    { value: '>', label: t('search.size.larger_than.string') },
    { value: '<', label: t('search.size.smaller_than.string') },
  ]

  const labelOptions = useMemo(
    () =>
      allCategories.map((category) => ({
        value: category.name,
        label: category.name,
      })),
    [allCategories]
  )

  const operatorOptions = [
    { value: 'AND', label: t('search.operator.and.string') },
    { value: 'OR', label: t('search.operator.or.string') },
  ]

  const dateRangeOptions = dateRangePresets.map((preset) => ({
    value: preset,
    label: t(`search.date_range.${preset}.string`),
  }))

  return (
    <>
      <FormField
        control={form.control}
        name="operator"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('search.operator.label.string')}</FormLabel>
            <RadioGroupForm
              options={operatorOptions}
              value={field.value}
              onValueChange={field.onChange}
              horizontal
            />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="from"
          render={({ field }) => {
            const handlers = makeRecipientFieldHandlers(
              field.value,
              field.onChange
            )
            return (
              <FormItem>
                <FormLabel>{t('from.string')}</FormLabel>
                <FormControl>
                  <RecipientAutocompleteField
                    {...handlers}
                    name={field.name}
                    placeholder={t('from.string')}
                    loadingLabel={loadingLabel}
                    getAddDirectLabel={getAddDirectLabel}
                    allowFreeText
                  />
                </FormControl>
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => {
            const handlers = makeRecipientFieldHandlers(
              field.value,
              field.onChange
            )
            return (
              <FormItem>
                <FormLabel>{t('search.to_or_cc.string')}</FormLabel>
                <FormControl>
                  <RecipientAutocompleteField
                    {...handlers}
                    name={field.name}
                    placeholder={t('search.to_or_cc.string')}
                    loadingLabel={loadingLabel}
                    getAddDirectLabel={getAddDirectLabel}
                    allowFreeText
                  />
                </FormControl>
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name="bcc"
          render={({ field }) => {
            const handlers = makeRecipientFieldHandlers(
              field.value,
              field.onChange
            )
            return (
              <FormItem>
                <FormLabel>{t('bcc.string')}</FormLabel>
                <FormControl>
                  <RecipientAutocompleteField
                    {...handlers}
                    name={field.name}
                    placeholder={t('bcc.string')}
                    loadingLabel={loadingLabel}
                    getAddDirectLabel={getAddDirectLabel}
                    allowFreeText
                  />
                </FormControl>
              </FormItem>
            )
          }}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('subject.string')}</FormLabel>
              <FormControl>
                <Input {...field} className="w-full" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('search.full_text.string')}</FormLabel>
              <FormControl>
                <Input {...field} className="w-full" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>{t('search.size.label.string')}</FormLabel>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="sizeOperator"
              render={({ field }) => (
                <div className="w-40 shrink-0">
                  <SelectForm
                    options={sizeOperatorOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="sizeValue"
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    disabled={sizeOperator === 'any'}
                    className="w-full"
                  />
                </FormControl>
              )}
            />
            <FormField
              control={form.control}
              name="sizeUnit"
              render={({ field }) => (
                <div className="w-24 shrink-0">
                  <SelectForm
                    options={SIZE_UNIT_OPTIONS}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={sizeOperator === 'any'}
                  />
                </div>
              )}
            />
          </div>
        </FormItem>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FormField
          control={form.control}
          name="hasAttachment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('search.attachment.label.string')}</FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal">
                  {t('search.with_attachments.string')}
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        {hasAttachment && (
          <FormField
            control={form.control}
            name="attachmentType"
            render={({ field }) => (
              <FormItem>
                <MultiSelect
                  options={ATTACHMENT_TYPE_OPTIONS}
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder={t('search.attachment_type.placeholder.string')}
                />
              </FormItem>
            )}
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FormField
          control={form.control}
          name="isRead"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('search.read_status.label.string')}</FormLabel>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value === 'read'}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? 'read' : 'any')
                    }
                  />
                  <FormLabel className="cursor-pointer font-normal">
                    {t('search.read_status.read.string')}
                  </FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value === 'unread'}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? 'unread' : 'any')
                    }
                  />
                  <FormLabel className="cursor-pointer font-normal">
                    {t('search.read_status.unread.string')}
                  </FormLabel>
                </div>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isFlagged"
          render={({ field }) => (
            <FormItem>
              <span
                aria-hidden
                className="invisible block text-sm leading-none"
              >
                &nbsp;
              </span>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal">
                  {t('search.important.string')}
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormField
          control={form.control}
          name="labels"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('search.labels.string')}</FormLabel>
              <MultiSelect
                options={labelOptions}
                selected={field.value}
                onChange={field.onChange}
                placeholder={t('search.labels.placeholder.string')}
                emptyText={t('search.labels.empty.string')}
              />
            </FormItem>
          )}
        />
      </div>
      <div className="flex flex-wrap gap-4 sm:flex-nowrap">
        <FormField
          control={form.control}
          name="dateRangePreset"
          render={({ field }) => (
            <FormItem className="w-48 shrink-0">
              <FormLabel>{t('search.date_range.label.string')}</FormLabel>
              <SelectForm
                options={dateRangeOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            </FormItem>
          )}
        />
        {dateRangePreset !== 'anytime' && (
          <>
            {(dateRangePreset === 'after' || dateRangePreset === 'between') && (
              <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => (
                  <FormItem className="min-w-40 flex-1">
                    <FormLabel>{t('search.date_from.string')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="w-full" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {(dateRangePreset === 'before' ||
              dateRangePreset === 'between') && (
              <FormField
                control={form.control}
                name="dateTo"
                render={({ field }) => (
                  <FormItem className="min-w-40 flex-1">
                    <FormLabel>{t('search.date_to.string')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="w-full" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </>
        )}
      </div>
    </>
  )
}

export default SearchMoreOptions
