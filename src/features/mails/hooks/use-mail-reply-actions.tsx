'use client'

import type {
  Action,
  RightActionsType,
} from '@/features/mails/components/mail/types'
import { ActionId } from '@/features/mails/components/mail/types'
import type { ImapMessages } from '@/features/mails/mails-types'
import {
  createDraft,
  useLazyGetEditMessageQuery,
  useLazyGetReplyMessageQuery,
} from '@/features/mails/store'
import {
  isDraftFolderType,
  isTemplateFolderType,
} from '@/features/mails/utils/folder-type-helpers'
import {
  apiDataToMailComposeDraft,
  buildForwardedBody,
  buildQuotedReplyBody,
  buildReplyRecipients,
  replySubject,
} from '@/features/mails/utils/mail-compose-from-api'
import { useProfile } from '@/features/user-profile'
import { useAppDispatch } from '@/lib/redux/hooks'
import { createClientId } from '@/lib/utils/create-client-id'
import { Forward, Reply, ReplyAll } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface UseMailReplyActionsOptions {
  mail?: ImapMessages
  mailId?: string
  folder?: string
  accountId?: string
  folderType?: import('@/features/mails/mails-types').ImapFolderType
}

export function useMailReplyActions({
  mail,
  mailId,
  folder,
  accountId,
  folderType,
}: UseMailReplyActionsOptions) {
  const t = useTranslations('MAILS_COMMONS')
  const dispatch = useAppDispatch()
  const [triggerGetEditMessage] = useLazyGetEditMessageQuery()
  const [triggerGetReplyMessage] = useLazyGetReplyMessageQuery()
  const { allMailboxes, user } = useProfile()

  /** Every address the user sends as, so "reply all" leaves them out. */
  const ownEmails = [
    ...allMailboxes.flatMap((mailbox) =>
      mailbox.identities.map((identity) => identity.mail)
    ),
    user?.email ?? '',
  ]

  const notifyComposeLoadError = () => {
    toast.error(t('mail_display.compose_load_error.string'))
  }

  const rightActions: RightActionsType = [
    {
      id: ActionId.REPLY,
      icon: <Reply size={18} />,
      title: t('mail_display.action-bar.reply.string'),
    },
    {
      id: ActionId.REPLY_ALL,
      icon: <ReplyAll size={18} />,
      title: t('mail_display.action-bar.reply_all.string'),
    },
    {
      id: ActionId.FORWARD,
      icon: <Forward size={18} />,
      title: t('mail_display.action-bar.forward.string'),
    },
  ]

  const handleMailAction = (_idx: number, action: Action) => {
    if (!mail || !mailId || !folder) return

    if (action.id === ActionId.FORWARD) {
      const draftId = createClientId()

      void (async () => {
        const result = await triggerGetEditMessage({
          folder,
          mailId,
          accountId,
        })
        if (result.error || !result.data) {
          notifyComposeLoadError()
          return
        }
        const mailData = { ...mail, ...result.data }
        const draftData = apiDataToMailComposeDraft(draftId, mailData)
        dispatch(
          createDraft({
            draftId,
            forwardOf: mailId,
            initialData: {
              ...draftData,
              to: [],
              body: buildForwardedBody(mailData, draftData.body),
            },
          })
        )
      })()
    } else if (
      action.id === ActionId.REPLY ||
      action.id === ActionId.REPLY_ALL
    ) {
      const draftId = createClientId()

      void (async () => {
        const result = await triggerGetReplyMessage({
          folder,
          mailId,
          accountId,
        })
        // Without the server draft (key) the reply cannot be saved or sent.
        if (result.error || !result.data) {
          notifyComposeLoadError()
          return
        }
        const mailData = { ...mail, ...result.data }
        const draftData = apiDataToMailComposeDraft(draftId, mailData)
        // Recipients come from the original message: /reply echoes its To/Cc.
        // reply_to is left out on purpose: the server currently fills it
        // from the In-Reply-To header (a Message-ID), not from Reply-To.
        const { to, cc } = buildReplyRecipients(
          { from: mail.from, to: mail.to, cc: mail.cc },
          { replyAll: action.id === ActionId.REPLY_ALL, ownEmails }
        )
        dispatch(
          createDraft({
            draftId,
            inReplyTo: mailId,
            initialData: {
              ...draftData,
              to,
              cc,
              bcc: [],
              subject: replySubject(mail.subject),
              body: buildQuotedReplyBody(mailData, draftData.body),
            },
          })
        )
      })()
    }
  }

  const hideReplyActions =
    isDraftFolderType(folderType) || isTemplateFolderType(folderType)

  return {
    rightActions: hideReplyActions ? [] : rightActions,
    handleMailAction,
    hideReplyActions,
  }
}
