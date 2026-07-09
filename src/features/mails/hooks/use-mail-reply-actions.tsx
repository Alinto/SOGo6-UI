'use client'

import type {
  Action,
  RightActionsType,
} from '@/features/mails/components/mail/types'
import { ActionId } from '@/features/mails/components/mail/types'
import type { ImapMessages, ImapFolderType } from '@/features/mails/mails-types'
import {
  isDraftFolderType,
  isTemplateFolderType,
} from '@/features/mails/utils/folder-type-helpers'
import {
  createDraft,
  useLazyGetEditMessageQuery,
  useLazyGetReplyMessageQuery,
} from '@/features/mails/store'
import {
  apiDataToMailComposeDraft,
  buildForwardedBody,
  buildQuotedReplyBody,
} from '@/features/mails/utils/mail-compose-from-api'
import { useAppDispatch } from '@/lib/redux/hooks'
import { createClientId } from '@/lib/utils/create-client-id'
import { Forward, Reply, ReplyAll } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
        const mailData = { ...mail, ...result.data }
        const draftData = apiDataToMailComposeDraft(draftId, mailData)
        dispatch(
          createDraft({
            draftId,
            inReplyTo: mailId,
            initialData: {
              ...draftData,
              cc: action.id === ActionId.REPLY_ALL ? draftData.cc : [],
              bcc: [],
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
