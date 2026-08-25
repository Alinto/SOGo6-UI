'use client'

import { Checkbox } from '@/components/ui/checkbox'
import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo } from 'react'

interface OutboxToolbarProps {
  itemIds: string[]
  onBulkDelete: (ids: string[]) => void
}

function OutboxToolbar({ itemIds, onBulkDelete }: OutboxToolbarProps) {
  const t = useTranslations('PWA')
  const tList = useTranslations('MAILS_LIST')
  const dispatch = useAppDispatch()
  const selectedIds = useAppSelector(
    (state: RootState) => state.mailLayout.selectedMailIds
  )

  useEffect(() => {
    dispatch(clearSelectedMails())
  }, [dispatch])

  const allSelected =
    itemIds.length > 0 && selectedIds.length === itemIds.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const selectedInList = useMemo(
    () => selectedIds.filter((id) => itemIds.includes(id)),
    [itemIds, selectedIds]
  )

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      dispatch(setSelectedMails(itemIds))
    } else {
      dispatch(clearSelectedMails())
    }
  }

  return (
    <div className="bg-background border-border flex w-full min-w-0 shrink-0 flex-col gap-1 overflow-x-hidden border-b px-3 py-2">
      <div className="flex min-w-0 flex-row flex-wrap items-center justify-between gap-y-1">
        <div className="flex h-8 min-w-0 flex-row items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center">
            <Checkbox
              checked={
                allSelected ? true : someSelected ? 'indeterminate' : false
              }
              onCheckedChange={handleSelectAll}
            />
          </span>
          {selectedInList.length > 0 ? (
            <MailActionsBar
              compact
              actions={[
                {
                  id: 'bulk-delete',
                  title: t('outbox_delete.string'),
                  icon: <Trash2 size={16} />,
                },
              ]}
              onAction={() => {
                onBulkDelete(selectedInList)
              }}
            />
          ) : (
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="text-lg leading-none font-semibold">
                {t('outbox_folder.string')}
              </span>
              <span className="text-muted-foreground hidden text-sm leading-none md:inline">
                {tList('messages_number.string', { number: itemIds.length })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(OutboxToolbar)
