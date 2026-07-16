'use client'

import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import MailContent from '@/features/mails/components/mail/mail-content'
import MailDetailActionBar from '@/features/mails/components/mail/mail-detail-action-bar'
import MailHeader from '@/features/mails/components/mail/mail-header'
import MailHeaderMobile from '@/features/mails/components/mail/mail-header-mobile'
import { MailReturnButton } from '@/features/mails/components/mail/mail-return-button'
import MailSubject from '@/features/mails/components/mail/mail-subject'
import type { Action } from '@/features/mails/components/mail/types'
import { ActionId } from '@/features/mails/components/mail/types'
import {
  buildAttachmentsUrl,
  parseEmailContact,
} from '@/features/mails/components/mail/utils'
import MailDetailSkeleton from '@/features/mails/components/skeletons/skeleton'
import { useCurrentFolder } from '@/features/mails/hooks/use-current-folder'
import { useMailDetailFolderActions } from '@/features/mails/hooks/use-mail-detail-folder-actions'
import { useMailReplyActions } from '@/features/mails/hooks/use-mail-reply-actions'
import { usePrintMail } from '@/features/mails/hooks/use-print-mail'
import { useGetMailQuery } from '@/features/mails/store/mails-api'
import { useIsMobile } from '@/hooks/use-mobile'
import { useRouter } from '@/lib/i18n/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'

const VisualizationPage: React.FC = () => {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const params = useParams() as {
    account: string
    folder: string | string[]
    mail_id: string
  }
  const { push } = useRouter()
  const { account, mail_id } = params
  const folder = Array.isArray(params.folder)
    ? params.folder.join('/')
    : (params.folder ?? '')
  const isMobile = useIsMobile()

  const { data, isLoading, isError } = useGetMailQuery({
    folder,
    mailId: mail_id,
    accountId: account,
  })

  const { handlePrint, isPrintDisabled } = usePrintMail(data)
  const { folderType } = useCurrentFolder(folder, account)
  const { rightActions, handleMailAction, hideReplyActions } =
    useMailReplyActions({
      mail: data,
      mailId: mail_id,
      folder,
      accountId: account,
      folderType,
    })
  const { folderSpecificActions, handleFolderSpecificAction } =
    useMailDetailFolderActions({
      folderType,
      folder,
      accountId: account,
      mailId: mail_id,
      mail: data,
    })

  if (!mail_id) return null
  if (isLoading)
    return (
      <div className="flex h-full w-full">
        <MailDetailSkeleton />
      </div>
    )
  if (isError || !data) return null

  const {
    from: fromRaw,
    to: toRaw,
    cc: ccRaw,
    isMailingList,
    date,
    subject,
  } = data
  const from = parseEmailContact(fromRaw)
  const to = toRaw.map(parseEmailContact)
  const cc = ccRaw ? ccRaw.map(parseEmailContact) : []

  const handleNavigationAction = (_idx: number, action: Action) => {
    if (action.id === ActionId.GO_BACK) {
      const prevId = Math.max(1, Number(mail_id) - 1)
      push(
        `/u/${account}/${encodeURIComponent(folder)}/${encodeURIComponent(String(prevId))}`
      )
    } else if (action.id === ActionId.GO_NEXT) {
      push(
        `/u/${account}/${encodeURIComponent(folder)}/${encodeURIComponent(String(Number(mail_id) + 1))}`
      )
    }
  }

  const actions = {
    navigation: [
      {
        id: ActionId.GO_BACK,
        icon: <ChevronLeft size={18} />,
        title: t('previous-mail.string'),
      },
      {
        id: ActionId.GO_NEXT,
        icon: <ChevronRight size={18} />,
        title: t('next-mail.string'),
      },
    ],
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="flex w-full flex-col p-3">
        <div className="mb-4 flex items-center gap-2">
          <MailReturnButton folderPath={folder} />
          <MailDetailActionBar
            accountId={Array.isArray(account) ? account[0] : account}
            folder={folder}
            folderType={folderType}
            mailId={mail_id}
            mail={data}
            seen={data.seen}
            flags={data.flags}
            onPrint={handlePrint}
            isPrintDisabled={isPrintDisabled}
          />
          <div className="ml-auto">
            {isMobile ? (
              <MailActionsBar
                actions={[
                  ...folderSpecificActions,
                  ...(hideReplyActions ? [] : rightActions),
                ]}
                onAction={(idx, action) => {
                  if (handleFolderSpecificAction(action)) return
                  handleMailAction(idx, action)
                }}
              />
            ) : (
              <MailActionsBar
                actions={actions.navigation}
                onAction={(idx, action) => handleNavigationAction(idx, action)}
              />
            )}
          </div>
        </div>
        <MailSubject subject={subject} className="h-auto min-h-fit" />
        <div className="w-full overflow-hidden rounded-lg border p-4 shadow">
          {isMobile ? (
            <MailHeaderMobile
              from={from}
              to={to}
              cc={cc}
              showUnsubscribeButton={!!isMailingList}
              date={date}
            />
          ) : (
            <MailHeader
              from={from}
              to={to}
              cc={cc}
              showUnsubscribeButton={!!isMailingList}
              date={date}
              mail={data}
              mailId={mail_id}
              folder={folder}
              accountId={account}
            />
          )}
          <MailContent
            body={data.body}
            attachments={data.attachments}
            attachmentsUrl={buildAttachmentsUrl({
              accountId: account,
              folder,
              mailId: mail_id,
            })}
          />
        </div>
      </div>
    </div>
  )
}

export default VisualizationPage
