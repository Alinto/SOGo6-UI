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
  const hasAttachment = form.watch('hasAttachment')

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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
