'use client'

import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import MailContent from '@/features/mails/components/mail/mail-content'
import MailDetailActionBar from '@/features/mails/components/mail/mail-detail-action-bar'
import MailHeader from '@/features/mails/components/mail/mail-header'
import MailHeaderMobile from '@/features/mails/components/mail/mail-header-mobile'
import MailInvitationWidget from '@/features/mails/components/mail/mail-invitation-widget'
import { MailReturnButton } from '@/features/mails/components/mail/mail-return-button'
import MailSubject from '@/features/mails/components/mail/mail-subject'
import { parseEmailContact } from '@/features/mails/components/mail/utils'
import MailDetailSkeleton from '@/features/mails/components/skeletons/skeleton'
import { useMailDetailNavigation } from '@/features/mails/hooks/use-mail-detail-navigation'
import { useMailInvitation } from '@/features/mails/hooks/use-mail-invitation'
import { useMailReplyActions } from '@/features/mails/hooks/use-mail-reply-actions'
import { usePrintMail } from '@/features/mails/hooks/use-print-mail'
import { useGetMailQuery } from '@/features/mails/store/mails-api'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppSelector } from '@/lib/redux/hooks'

import { Action, ActionId } from '@/features/mails/components/mail/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'

const MailPage: React.FC = () => {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const params = useParams() as {
    account: string
    folder: string
    mail_id: string
  }
  const { folder, account, mail_id } = params
  const isMobile = useIsMobile()
  const {
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    navigation: mailNavigation,
  } = useMailDetailNavigation()

  const { data, isLoading, isError } = useGetMailQuery({
    folder,
    mailId: mail_id,
    accountId: account,
  })

  const currentUserEmail = useAppSelector((state) => state.auth.user?.email)
  const invitation = useMailInvitation(data, currentUserEmail)

  const { handlePrint, isPrintDisabled } = usePrintMail(data)
  const { rightActions, handleMailAction } = useMailReplyActions({
    mail: data,
    mailId: mail_id,
    folder,
    accountId: account,
  })

  if (isLoading) return <MailDetailSkeleton />
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

  const handleNavigationAction = (idx: number, action: Action) => {
    if (action.id === ActionId.GO_BACK) {
      handleGoBack()
    } else if (action.id === ActionId.GO_NEXT) {
      handleGoNext()
    }
  }

  const handleGoBack = () => {
    goPrev()
  }

  const handleGoNext = () => {
    goNext()
  }
  const actions = {
    navigation: [
      {
        id: ActionId.GO_BACK,
        icon: <ChevronLeft size={18} />,
        title: t('previous-mail.string'),
        disabled: !canGoPrev,
      },
      {
        id: ActionId.GO_NEXT,
        icon: <ChevronRight size={18} />,
        title: t('next-mail.string'),
        disabled: !canGoNext,
      },
    ],
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <MailReturnButton folderPath={folder} />
        <MailDetailActionBar
          accountId={Array.isArray(account) ? account[0] : account}
          folder={Array.isArray(folder) ? folder.join('/') : folder}
          mailId={mail_id}
          seen={data.seen}
          flags={data.flags}
          navigation={mailNavigation}
          onPrint={handlePrint}
          isPrintDisabled={isPrintDisabled}
        />
        <div className="ml-auto">
          {isMobile ? (
            <MailActionsBar
              actions={rightActions}
              onAction={(idx, action) => handleMailAction(idx, action)}
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
        {invitation.kind !== 'none' ? (
          <MailInvitationWidget state={invitation} />
        ) : null}
        {invitation.kind === 'none' || data.body?.trim() ? (
          <MailContent body={data.body} attachments={data.attachments} />
        ) : null}
      </div>
    </div>
  )
}

export default MailPage
