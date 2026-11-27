'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMailListStatusFilter } from '@/features/mails/hooks/use-mail-list-status-filter'
import { useTranslations } from 'next-intl'
import React from 'react'

const ListFilterDropdown: React.FC = () => {
  const t = useTranslations('MAILS_LIST')
  // Same state as the ListFilter buttons.
  const { value: filter, setValue: handleFilterChange } =
    useMailListStatusFilter()

  return (
    <Select value={filter} onValueChange={handleFilterChange}>
      <SelectTrigger
        aria-label={t('filter.label.string')}
        className="hover:bg-accent hover:text-accent-foreground w-auto cursor-pointer"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('filter.all.string')}</SelectItem>
        <SelectItem value="read">{t('filter.read.string')}</SelectItem>
        <SelectItem value="unread">{t('filter.unread.string')}</SelectItem>
        <SelectItem value="flagged">{t('filter.flagged.string')}</SelectItem>
        <SelectItem value="attachments">
          {t('filter.attachments.string')}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default ListFilterDropdown
