'use client'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { setMailLayout } from '@/features/mails/store/mail-layout-slice'
import type { MailLayoutMode } from '@/features/mails/store/mail-layout-slice'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { Maximize2, PanelRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'

const ListFilter: React.FC = () => {
  const t = useTranslations('MAILS_LIST')
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { push } = useRouter()
  const filter = searchParams.get('filter') || 'all'
  const isMobile = useIsMobile()
  const dispatch = useAppDispatch()
  const mailLayoutMode = useAppSelector((state: RootState) => state.mailLayout.mode)

  return (
    <div className="flex items-center gap-2">
      <ToggleGroup
        variant={'outline'}
        type="single"
        value={filter}
        defaultValue="all"
        onValueChange={(value) => {
          const newParams = new URLSearchParams(searchParams.toString())
          if (!value || value === 'all') {
            newParams.delete('filter')
          } else {
            newParams.set('filter', value)
          }
          newParams.delete('page')
          const query = newParams.toString()
          push(query ? `${pathname}?${query}` : pathname)
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

      {!isMobile && (
        <ToggleGroup
          variant="outline"
          type="single"
          value={mailLayoutMode}
          onValueChange={(value) => {
            if (value) {
              dispatch(setMailLayout(value as MailLayoutMode))
            }
          }}
        >
          <ToggleGroupItem
            value="full"
            aria-label={t('layout.full.string')}
          >
            <TooltipWrapper content={t('layout.full.string')}>
              <Maximize2 size={16} />
            </TooltipWrapper>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="split"
            aria-label={t('layout.split.string')}
          >
            <TooltipWrapper content={t('layout.split.string')}>
              <PanelRight size={16} />
            </TooltipWrapper>
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  )
}

export default ListFilter
