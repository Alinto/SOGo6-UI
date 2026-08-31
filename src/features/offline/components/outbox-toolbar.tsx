'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import { flushOutboxWithToasts } from '@/features/offline/outbox/outbox-flush-feedback'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { Send, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo } from 'react'

interface OutboxToolbarProps {
  itemIds: string[]
  onBulkDelete: (ids: string[]) => void
}

function OutboxToolbar({ itemIds, onBulkDelete }: OutboxToolbarProps) {
  const t = useTranslations('PWA')
  const listT = useTranslations('MAILS_LIST')
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
                {listT('messages_number.string', { number: itemIds.length })}
              </span>
            </div>
          )}
        </div>
        {selectedInList.length === 0 && itemIds.length > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const userId = getAuthUserId()
              if (!userId) return
              void flushOutboxWithToasts(userId, t, { force: true })
            }}
          >
            <Send className="mr-1 size-4" aria-hidden />
            {t('outbox_send_all.string')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export default memo(OutboxToolbar)
