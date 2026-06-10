'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'

const ListFilterDropdown: React.FC = () => {
  const t = useTranslations('MAILS_LIST')
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { push } = useRouter()
  const filter = searchParams.get('filter') || 'all'

  const handleFilterChange = (value: string) => {
    if (!value || value === 'all') {
      push(pathname)
    } else {
      push(`?filter=${value}`)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Select value={filter} onValueChange={handleFilterChange}>
        <SelectTrigger className="hover:bg-accent hover:text-accent-foreground w-auto cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filter.all.string')}</SelectItem>
          <SelectItem value="read">{t('filter.read.string')}</SelectItem>
          <SelectItem value="unread">{t('filter.unread.string')}</SelectItem>
          <SelectItem value="starred">{t('filter.starred.string')}</SelectItem>
          <SelectItem value="attachments">
            {t('filter.attachments.string')}
          </SelectItem>
        </SelectContent>
      </Select>
      {filter !== 'all' && (
        <p className="text-muted-foreground max-w-[12rem] text-xs">
          {t('filter.client_scope_notice.string')}
        </p>
      )}
    </div>
  )
}

export default ListFilterDropdown
