'use client'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'

const ListFilter: React.FC = () => {
  const t = useTranslations('MAILS_LIST')
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { push } = useRouter()
  const filter = searchParams.get('filter') || 'all'
  return (
    <div>
      <ToggleGroup
        variant={'outline'}
        type="single"
        value={filter}
        defaultValue="all"
        onValueChange={(value) => {
          if (!value || value === 'all') {
            push(pathname)
          } else {
            push(`?filter=${value}`)
          }
        }}
      >
        <ToggleGroupItem value="all" aria-label={t('filter.all.string')}>
          {t('filter.all.string')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="read"
          aria-pressed={true}
          aria-label={t('filter.read.string')}
          className="w-auto flex-none"
        >
          {t('filter.read.string')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="unread"
          aria-label={t('filter.unread.string')}
          className="w-auto flex-none"
        >
          {t('filter.unread.string')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="starred"
          aria-label={t('filter.starred.string')}
          className="w-auto flex-none"
        >
          {t('filter.starred.string')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="attachments"
          aria-label={t('filter.attachments.string')}
          className="w-auto flex-none"
        >
          {t('filter.attachments.string')}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export default ListFilter
