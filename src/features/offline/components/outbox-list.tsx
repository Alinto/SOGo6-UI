'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import ListItem from '@/features/mails/components/list-item'
import AddressBookListSkeleton from '@/features/mails/components/skeletons/skeleton'
import type { ImapMessagesList } from '@/features/mails/mails-types'
import { setSelectedMails } from '@/features/mails/store/mail-layout-slice'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { memo, useMemo, type MouseEvent } from 'react'
import { useOutboxList } from '../hooks/use-outbox'
import type { OutboxRecord } from '../types'
import { outboxRecordToListItem } from '../utils/outbox-to-list-item'
import CachedDataIndicator from './cached-data-indicator'
import OutboxToolbar from './outbox-toolbar'

function statusKey(status: OutboxRecord['status']) {
  if (status === 'pending') return 'outbox_status_pending.string' as const
  if (status === 'sending') return 'outbox_status_sending.string' as const
  return 'outbox_status_failed.string' as const
}

interface OutboxListProps {
  onOpen: (id: string) => void
  onRequestDelete: (ids: string[]) => void
}

function OutboxList({ onOpen, onRequestDelete }: OutboxListProps) {
  const t = useTranslations('PWA')
  const isMobile = useIsMobile()
  const dispatch = useAppDispatch()
  const { items, loading } = useOutboxList()
  const selectedIds = useAppSelector(
    (state: RootState) => state.mailLayout.selectedMailIds
  )

  const listItems = useMemo(
    () =>
      items.map((item) =>
        outboxRecordToListItem(item, {
          subject: item.subject || t('outbox_no_subject.string'),
          snippet: item.lastError
            ? `${t(statusKey(item.status))} — ${item.lastError}`
            : t(statusKey(item.status)),
        })
      ),
    [items, t]
  )

  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  const handleCheckboxClick = (e: MouseEvent, item: ImapMessagesList) => {
    e.stopPropagation()
    const id = String(item.id)
    const next = selectedIds.includes(id)
      ? selectedIds.filter((selected) => selected !== id)
      : [...selectedIds, id]
    dispatch(setSelectedMails(next))
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
        <OutboxToolbar itemIds={[]} onBulkDelete={onRequestDelete} />
        <AddressBookListSkeleton />
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <OutboxToolbar itemIds={itemIds} onBulkDelete={onRequestDelete} />
        <CachedDataIndicator className="px-4 py-2" />
        <ul
          className={cn(
            'min-h-0 flex-1 overflow-y-auto rounded',
            isMobile && 'pb-12'
          )}
        >
          {listItems.length === 0 && (
            <li className="text-foreground mt-3 flex h-14 items-center justify-center rounded-full text-center">
              {t('outbox_empty.string')}
            </li>
          )}
          {listItems.map((item) => (
            <li key={item.id}>
              <ListItem
                data={item}
                onHandleCheckboxClick={handleCheckboxClick}
                isSelected={selectedIds.includes(String(item.id))}
                onOpenMail={onOpen}
              />
            </li>
          ))}
        </ul>
      </div>
    </TooltipProvider>
  )
}

export default memo(OutboxList)
