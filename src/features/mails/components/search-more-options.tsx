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
import { useTranslations } from 'next-intl'
import React, { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useMailCategoryPicker } from '../hooks/use-mail-category-picker'
import {
  dateRangePresets,
  type SearchFormValues,
} from '../utils/mail-search-form'

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
  const dateRangePreset = form.watch('dateRangePreset')

  const labelOptions = useMemo(
    () =>
      allCategories.map((category) => ({
        value: category.name,
        label: category.name,
      })),
    [allCategories]
  )

  const readStatusOptions = [
    { value: 'any', label: t('search.read_status.any.string') },
    { value: 'unread', label: t('search.read_status.unread.string') },
    { value: 'read', label: t('search.read_status.read.string') },
  ]

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
          <FormItem className="pt-2">
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
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FormField
          control={form.control}
          name="from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('from.string')}</FormLabel>
              <FormControl>
                <Input {...field} className="w-full" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('search.to_or_cc.string')}</FormLabel>
              <FormControl>
                <Input {...field} className="w-full" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bcc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bcc.string')}</FormLabel>
              <FormControl>
                <Input {...field} className="w-full" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4">
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
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-2">
        <FormField
          control={form.control}
          name="hasAttachment"
          render={({ field }) => (
            <FormItem className="flex items-center space-y-0 space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">
                {t('search.with_attachments.string')}
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isFlagged"
          render={({ field }) => (
            <FormItem className="flex items-center space-y-0 space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">
                {t('search.in_favorites.string')}
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
      <div className="mt-4">
        <FormField
          control={form.control}
          name="attachmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('search.attachment_type.string')}</FormLabel>
              <MultiSelect
                options={ATTACHMENT_TYPE_OPTIONS}
                selected={field.value}
                onChange={field.onChange}
                placeholder={t('search.attachment_type.placeholder.string')}
              />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-4">
        <FormField
          control={form.control}
          name="isRead"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('search.read_status.label.string')}</FormLabel>
              <RadioGroupForm
                options={readStatusOptions}
                value={field.value}
                onValueChange={field.onChange}
                horizontal
              />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-4">
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
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <FormField
          control={form.control}
          name="dateRangePreset"
          render={({ field }) => (
            <FormItem className="w-48">
              <FormLabel>{t('search.date_range.label.string')}</FormLabel>
              <SelectForm
                options={dateRangeOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            </FormItem>
          )}
        />
        {(dateRangePreset === 'after' || dateRangePreset === 'between') && (
          <FormField
            control={form.control}
            name="dateFrom"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('search.date_from.string')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="w-full" />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        {(dateRangePreset === 'before' || dateRangePreset === 'between') && (
          <FormField
            control={form.control}
            name="dateTo"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('search.date_to.string')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="w-full" />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>
    </>
  )
}

export default SearchMoreOptions
