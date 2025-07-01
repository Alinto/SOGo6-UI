'use client'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'

const ListFilter: React.FC = () => {
  const t = useTranslations('Mails_Common')
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
        <ToggleGroupItem value="all" aria-label={t('list.filter.all.string')}>
          {t('list.filter.all.string')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="read"
          aria-pressed={true}
          aria-label={t('list.filter.read.string')}
          className="w-auto flex-none"
        >
          {t('list.filter.read.string')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="unread"
          aria-label={t('list.filter.unread.string')}
          className="w-auto flex-none"
        >
          {t('list.filter.unread.string')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="starred"
          aria-label={t('list.filter.starred.string')}
          className="w-auto flex-none"
        >
          {t('list.filter.starred.string')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="attachments"
          aria-label={t('list.filter.attachments.string')}
          className="w-auto flex-none"
        >
          {t('list.filter.attachments.string')}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export default ListFilter
