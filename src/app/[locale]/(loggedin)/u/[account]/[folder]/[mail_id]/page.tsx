'use client'

import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import MailContent from '@/features/mails/components/mail/mail-content'
import MailDetailActionBar from '@/features/mails/components/mail/mail-detail-action-bar'
import MailHeader from '@/features/mails/components/mail/mail-header'
import MailHeaderMobile from '@/features/mails/components/mail/mail-header-mobile'
import MailInvitationWidget from '@/features/mails/components/mail/mail-invitation-widget'
import { MailReturnButton } from '@/features/mails/components/mail/mail-return-button'
import MailSubject from '@/features/mails/components/mail/mail-subject'
import MailSubjectLabels from '@/features/mails/components/mail/mail-subject-labels'
import {
  buildAttachmentsUrl,
  parseEmailContact,
} from '@/features/mails/components/mail/utils'
import MailDetailSkeleton from '@/features/mails/components/skeletons/skeleton'
import { useMailDetailNavigation } from '@/features/mails/hooks/use-mail-detail-navigation'
import { useMailInvitation } from '@/features/mails/hooks/use-mail-invitation'
import { useMailReplyActions } from '@/features/mails/hooks/use-mail-reply-actions'
import { usePrintMail } from '@/features/mails/hooks/use-print-mail'
import type { ImapMessages } from '@/features/mails/mails-types'
import { useGetMailQuery } from '@/features/mails/store/mails-api'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { useMailCache } from '@/features/offline'
import CachedDataIndicator from '@/features/offline/components/cached-data-indicator'
import OfflineUnavailable from '@/features/offline/components/offline-unavailable'
import { useOfflineMailBody } from '@/features/offline/hooks/use-offline-mail-body'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppSelector } from '@/lib/redux/hooks'

import { Action, ActionId } from '@/features/mails/components/mail/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'

export interface MailDetailPageProps {
  account: string
  folder: string
  mailId: string
  onBack?: () => void
}

export function MailDetailPage({
  account,
  folder,
  mailId: mail_id,
  onBack,
}: MailDetailPageProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const isOfflineOverlay = typeof onBack === 'function'
  const isMobile = useIsMobile()
  const { cacheBody } = useMailCache()
  const { canGoPrev, canGoNext, goPrev, goNext } = useMailDetailNavigation()

  const {
    data: fetchedMail,
    isLoading,
    isError,
  } = useGetMailQuery(
    {
      folder,
      mailId: mail_id,
      accountId: account,
    },
    { skip: isOfflineOverlay }
  )

  // Offline fallback: serve the cached body of a previously opened mail
  const { data: cachedMail, isLoading: isCacheLoading } =
    useOfflineMailBody<ImapMessages>({
      accountId: account,
      folderPath: folder,
      mailId: mail_id,
      active: isOfflineOverlay || isError,
    })
  const data = fetchedMail ?? cachedMail ?? undefined

  useEffect(() => {
    if (!fetchedMail) return
    void cacheBody(account, folder, mail_id, fetchedMail)
  }, [account, cacheBody, fetchedMail, folder, mail_id])
  const currentUserEmail = useAppSelector((state) => state.auth.user?.email)
  const invitation = useMailInvitation(data, currentUserEmail)

  const { handlePrint, isPrintDisabled } = usePrintMail(data)
  const { rightActions, handleMailAction } = useMailReplyActions({
    mail: data,
    mailId: mail_id,
    folder,
    accountId: account,
  })

  if (
    (!isOfflineOverlay && isLoading) ||
    ((isOfflineOverlay || isError) && isCacheLoading)
  ) {
    return <MailDetailSkeleton />
  }
  if (!data) {
    return isOfflineOverlay || isError ? (
      <OfflineUnavailable force className="pt-16" />
    ) : null
  }

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
        disabled: isOfflineOverlay || !canGoPrev,
      },
      {
        id: ActionId.GO_NEXT,
        icon: <ChevronRight size={18} />,
        title: t('next-mail.string'),
        disabled: isOfflineOverlay || !canGoNext,
      },
    ],
  }

  const accountId = Array.isArray(account) ? account[0] : account

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <MailReturnButton folderPath={folder} onBack={onBack} />
        <MailDetailActionBar
          accountId={accountId}
          folder={Array.isArray(folder) ? folder.join('/') : folder}
          mailId={mail_id}
          seen={data.seen}
          flagged={data.flagged}
          flags={data.flags}
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
      <MailSubject
        subject={subject}
        className="h-auto min-h-fit"
        labels={
          <MailSubjectLabels
            accountId={accountId}
            folder={folder}
            mailId={mail_id}
            flags={data.flags}
          />
        }
      />
      <CachedDataIndicator className="px-1 pb-2" />
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
          <MailContent
            body={data.body}
            attachments={data.attachments}
            attachmentsUrl={buildAttachmentsUrl({
              accountId: account,
              folder,
              mailId: mail_id,
            })}
          />
        ) : null}
      </div>
    </div>
  )
}

const MailPage: React.FC = () => {
  const params = useParams() as {
    account: string
    folder: string | string[]
    mail_id: string
  }
  return (
    <MailDetailPage
      account={params.account}
      folder={folderPathFromParams(params.folder)}
      mailId={params.mail_id}
    />
  )
}

export default MailPage
