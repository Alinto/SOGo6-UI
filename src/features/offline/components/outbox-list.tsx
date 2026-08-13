'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import { getAuthUserId } from '../auth/get-auth-token'
import { getOutboxAttachments } from '../db/outbox-store'
import { useOutboxList } from '../hooks/use-outbox'
import type { OutboxAttachmentRecord, OutboxRecord } from '../types'

function statusKey(status: OutboxRecord['status']) {
  if (status === 'pending') return 'outbox_status_pending.string' as const
  if (status === 'sending') return 'outbox_status_sending.string' as const
  return 'outbox_status_failed.string' as const
}

interface OutboxListProps {
  /**
   * Move an outbox item back to a compose window. Returns true when the draft
   * was opened — the item is then removed from the queue (no double send).
   */
  onEdit: (item: OutboxRecord, attachments: OutboxAttachmentRecord[]) => boolean
}

function OutboxList({ onEdit }: OutboxListProps) {
  const t = useTranslations('PWA')
  const { items, loading, remove, refresh } = useOutboxList()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleEdit = async (item: OutboxRecord) => {
    const userId = getAuthUserId()
    if (!userId) return
    const attachments = await getOutboxAttachments(userId, item.id)
    if (onEdit(item, attachments)) {
      await remove(item.id)
    }
  }

  if (loading) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        {t('outbox_loading.string')}
      </p>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 p-8 text-center text-sm">
        <p>{t('outbox_empty.string')}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refresh()}
        >
          {t('outbox_refresh.string')}
        </Button>
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {item.subject || t('outbox_no_subject.string')}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {item.to.map((r) => r.email).join(', ')}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t(statusKey(item.status))}
                {item.lastError ? ` — ${item.lastError}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={item.status === 'sending'}
                onClick={() => void handleEdit(item)}
              >
                {t('outbox_edit.string')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => setDeleteId(item.id)}
              >
                {t('outbox_delete.string')}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('outbox_delete_confirm_title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('outbox_delete_confirm_body.string')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('outbox_cancel.string')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) void remove(deleteId)
                setDeleteId(null)
              }}
            >
              {t('outbox_delete.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default memo(OutboxList)
