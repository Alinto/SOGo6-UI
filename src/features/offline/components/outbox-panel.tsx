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
import type {
  MailComposeAttachment,
  MailComposeDraft,
} from '@/features/mails/store/mail-compose-slice'
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
import {
  holdOutboxForEdit,
  releaseOutboxForEdit,
} from '@/features/offline/outbox/outbox-edit-hold'
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
    async (item: OutboxRecord) => {
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

      const userId = getAuthUserId()
      if (!userId) return

      // Re-check in IndexedDB (the list may be stale, another tab may be
      // flushing) and hold atomically: refused while the item is sending.
      const fresh = await holdOutboxForEdit(userId, item.id).catch(() => null)
      if (!fresh) {
        toast.error(t('outbox_edit_unavailable.string'))
        return
      }

      let attachments: OutboxAttachmentRecord[]
      try {
        attachments = await getOutboxAttachments(userId, fresh.id)
      } catch {
        releaseOutboxForEdit(fresh.id, userId)
        toast.error(t('outbox_edit_unavailable.string'))
        return
      }

      const restoredAttachments: MailComposeAttachment[] = attachments.map(
        (attachment) => ({
          draftId: `outbox-${fresh.id}-${attachment.id}`,
          name: attachment.name,
          size: attachment.size,
          type: attachment.type,
          file: new File([attachment.blob], attachment.name, {
            type: attachment.type,
          }),
          // Only files already on the server draft are 'completed'; the
          // others must be uploaded by an online send.
          uploadStatus:
            attachment.uploaded && fresh.mailKey != null
              ? 'completed'
              : 'pending',
          uploadProgress: 100,
        })
      )

      dispatch(
        createDraft({
          draftId: `outbox-${fresh.id}`,
          initialData: {
            mailKey: fresh.mailKey,
            to: fresh.to,
            cc: fresh.cc,
            bcc: fresh.bcc,
            subject: fresh.subject,
            body: fresh.body,
            isPlainText: fresh.isPlainText,
            priority: fresh.priority as MailComposeDraft['priority'],
            requestReadReceipt: fresh.requestReadReceipt,
            selectedSignatureKey: fresh.signatureKey,
            selectedIdentity: identityStubFromOutbox(fresh),
            attachments: restoredAttachments,
            sourceOutboxId: fresh.id,
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
            void handleEdit(openItem)
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
