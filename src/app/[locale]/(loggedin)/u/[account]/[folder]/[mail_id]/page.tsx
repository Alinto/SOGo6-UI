'use client'

import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import MailContent from '@/features/mails/components/mail/mail-content'
import MailHeader from '@/features/mails/components/mail/mail-header'
import MailHeaderMobile from '@/features/mails/components/mail/mail-header-mobile'
import { MailReturnButton } from '@/features/mails/components/mail/mail-return-button'
import MailSubject from '@/features/mails/components/mail/mail-subject'
import { RightActionsType } from '@/features/mails/components/mail/types'
import { parseEmailContact } from '@/features/mails/components/mail/utils'
import MailDetailSkeleton from '@/features/mails/components/skeletons/skeleton'
import { useGetMailQuery } from '@/features/mails/store/mails-api'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppSelector } from '@/lib/redux/hooks'
import { useRouter } from '@/lib/i18n/navigation'

import { Action, ActionId } from '@/features/mails/components/mail/types'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Forward,
  Mail,
  MoreHorizontal,
  Reply,
  ReplyAll,
  Tag,
  Trash2,
} from 'lucide-react'
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
  const { push } = useRouter()
  const { folder, account, mail_id } = params
  const isMobile = useIsMobile()
  const mailNavigation = useAppSelector((state) => state.mailNavigation)

  const folderKey = `${Array.isArray(account) ? account[0] : account ?? ''}/${Array.isArray(folder) ? (folder as string[]).join('/') : folder ?? ''}`
  const isNavigationValid = mailNavigation.folderKey === folderKey
  const currentIndex = isNavigationValid
    ? mailNavigation.orderedIds.indexOf(mail_id)
    : -1

  const prevId =
    currentIndex > 0 ? mailNavigation.orderedIds[currentIndex - 1] : null
  const nextId =
    currentIndex !== -1 &&
    currentIndex < mailNavigation.orderedIds.length - 1
      ? mailNavigation.orderedIds[currentIndex + 1]
      : null

  const isFirstOfPage = currentIndex === 0
  const isLastOfPage =
    currentIndex === mailNavigation.orderedIds.length - 1
  const hasPrevPage = mailNavigation.page > 1
  const hasNextPage = mailNavigation.page < mailNavigation.totalPages

  const { data, isLoading, isError } = useGetMailQuery({
    folder,
    mailId: mail_id,
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
    if (prevId) {
      push(
        `/u/${account}/${encodeURIComponent(folder)}/${encodeURIComponent(prevId)}`
      )
    } else if (isNavigationValid && isFirstOfPage && hasPrevPage) {
      push(
        `/u/${account}/${encodeURIComponent(folder)}?page=${mailNavigation.page - 1}`
      )
    }
  }

  const handleGoNext = () => {
    if (nextId) {
      push(
        `/u/${account}/${encodeURIComponent(folder)}/${encodeURIComponent(nextId)}`
      )
    } else if (isNavigationValid && isLastOfPage && hasNextPage) {
      push(
        `/u/${account}/${encodeURIComponent(folder)}?page=${mailNavigation.page + 1}`
      )
    }
  }
  const actions = {
    mainMobile: [
      { icon: <Trash2 size={18} />, title: t('delete.string') },
      { icon: <MoreHorizontal size={18} />, title: t('more.string') },
    ],
    mainDesktop: [
      { icon: <Trash2 size={18} />, title: t('delete.string') },
      { icon: <Flame size={18} />, title: t('report_spam.string') },
      { icon: <Mail size={18} />, title: t('mark_unread.string') },
      { icon: <Tag size={18} />, title: t('label.string') },
      { icon: <MoreHorizontal size={18} />, title: t('more.string') },
    ],
    moreActions: [
      { icon: <Flame size={18} />, title: t('report_spam.string') },
      { icon: <Mail size={18} />, title: t('mark_unread.string') },
      { icon: <Tag size={18} />, title: t('label.string') },
    ],
    navigation: [
      {
        id: ActionId.GO_BACK,
        icon: <ChevronLeft size={18} />,
        title: t('previous-mail.string'),
        disabled:
          !prevId &&
          !(isNavigationValid && isFirstOfPage && hasPrevPage),
      },
      {
        id: ActionId.GO_NEXT,
        icon: <ChevronRight size={18} />,
        title: t('next-mail.string'),
        disabled:
          !nextId &&
          !(isNavigationValid && isLastOfPage && hasNextPage),
      },
    ],
  }

  const rightActions: RightActionsType = [
    {
      icon: <Reply size={18} />,
      title: t('reply.string'),
    },
    {
      icon: <ReplyAll size={18} />,
      title: t('reply_all.string'),
    },
    {
      icon: <Forward size={18} />,
      title: t('forward.string'),
    },
  ]
  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <MailReturnButton folderPath={folder} />
        {/* Mobile view */}
        <div className="flex gap-2 sm:hidden">
          <MailActionsBar actions={actions.mainMobile} />
        </div>
        {/* Desktop view */}
        <div className="hidden sm:flex sm:gap-2">
          <MailActionsBar actions={actions.mainDesktop} />
        </div>
        <div className="ml-auto">
          {isMobile ? (
            <MailActionsBar actions={rightActions} />
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
          />
        )}
        <MailContent body={data.body} attachments={data.attachments} />
      </div>
    </div>
  )
}

export default MailPage
