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
import {
  selectAllDrafts,
  selectOpenDraftIds,
} from '@/features/mails/store/mail-compose-selectors'
import type { MailComposeAttachment } from '@/features/mails/store/mail-compose-slice'
import {
  createDraft,
  MAX_OPEN_DRAFTS,
  setActiveDraft,
} from '@/features/mails/store/mail-compose-slice'
import { clearSelectedMails } from '@/features/mails/store/mail-layout-slice'
import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import OutboxList from '@/features/offline/components/outbox-list'
import OutboxMailView from '@/features/offline/components/outbox-mail-view'
import { getOutboxAttachments } from '@/features/offline/db/outbox-store'
import { holdOutboxForEdit } from '@/features/offline/outbox/outbox-edit-hold'
import type {
  OutboxAttachmentRecord,
  OutboxRecord,
} from '@/features/offline/types'
import type { Identity } from '@/features/user-profile/profile-types'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useOutboxList } from '../hooks/use-outbox'

function identityStubFromOutbox(item: OutboxRecord): Identity {
  return {
    mail: item.identityMail,
    name: '',
    replyTo: item.replyTo ?? '',
    isDefault: false,
    signatures: {},
  }
}

function OutboxPanel() {
  const t = useTranslations('PWA')
  const dispatch = useAppDispatch()
  const openDraftIds = useAppSelector(selectOpenDraftIds)
  const allDrafts = useAppSelector(selectAllDrafts)
  const { items, remove } = useOutboxList()
  const [openId, setOpenId] = useState<string | null>(null)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(
    null
  )

  const handleEdit = useCallback(
    async (item: OutboxRecord, attachments: OutboxAttachmentRecord[]) => {
      if (item.status === 'sending') return

      const existingDraftId = openDraftIds.find(
        (draftId) => allDrafts[draftId]?.sourceOutboxId === item.id
      )
      if (existingDraftId) {
        dispatch(setActiveDraft(existingDraftId))
        return
      }

      if (openDraftIds.length >= MAX_OPEN_DRAFTS) {
        toast.error(t('outbox_edit_limit.string'))
        return
      }

      const restoredAttachments: MailComposeAttachment[] = attachments.map(
        (attachment) => ({
          draftId: `outbox-${item.id}`,
          name: attachment.name,
          size: attachment.size,
          type: attachment.type,
          file: new File([attachment.blob], attachment.name, {
            type: attachment.type,
          }),
          uploadStatus: 'completed',
        })
      )

      holdOutboxForEdit(item.id)
      dispatch(
        createDraft({
          draftId: `outbox-${item.id}`,
          initialData: {
            mailKey: item.mailKey,
            to: item.to,
            cc: item.cc,
            bcc: item.bcc,
            subject: item.subject,
            body: item.body,
            isPlainText: item.isPlainText,
            priority: item.priority as 0 | 1 | 2 | 3 | 4,
            requestReadReceipt: item.requestReadReceipt,
            selectedSignatureKey: item.signatureKey,
            selectedIdentity: identityStubFromOutbox(item),
            attachments: restoredAttachments,
            sourceOutboxId: item.id,
          },
        })
      )
    },
    [allDrafts, dispatch, openDraftIds, t]
  )

  const runDelete = async () => {
    if (!pendingDeleteIds) return
    for (const id of pendingDeleteIds) {
      await remove(id)
    }
    dispatch(clearSelectedMails())
    if (openId && pendingDeleteIds.includes(openId)) setOpenId(null)
    setPendingDeleteIds(null)
  }

  const openItem = items.find((row) => row.id === openId) ?? null

  const deleteDialog = (
    <AlertDialog
      open={!!pendingDeleteIds}
      onOpenChange={(open) => !open && setPendingDeleteIds(null)}
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
          <AlertDialogAction onClick={() => void runDelete()}>
            {t('outbox_delete.string')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  if (openItem) {
    return (
      <>
        <OutboxMailView
          item={openItem}
          onBack={() => setOpenId(null)}
          onEdit={() => {
            const userId = getAuthUserId()
            if (!userId) return
            void getOutboxAttachments(userId, openItem.id).then(
              (attachments) => {
                void handleEdit(openItem, attachments)
              }
            )
          }}
          onDelete={() => setPendingDeleteIds([openItem.id])}
        />
        {deleteDialog}
      </>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <OutboxList
        onOpen={(id) => setOpenId(id)}
        onRequestDelete={setPendingDeleteIds}
      />
      {deleteDialog}
    </div>
  )
}

export default memo(OutboxPanel)
