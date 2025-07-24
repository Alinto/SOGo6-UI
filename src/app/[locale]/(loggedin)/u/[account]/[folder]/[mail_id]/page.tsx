'use client'

import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import MailHeader from '@/features/mails/components/mail/mail-header'
import { MailReturnButton } from '@/features/mails/components/mail/mail-return-button'
import MailSubject from '@/features/mails/components/mail/mail-subject'
import { parseEmailContact } from '@/features/mails/components/mail/utils'
import MailDetailSkeleton from '@/features/mails/components/skeletons/skeleton'
import { useGetMailQuery } from '@/features/mails/store/mails-api'
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Flame,
  Mail,
  MoreHorizontal,
  Tag,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'

const MailPage: React.FC = () => {
  const t = useTranslations('Mails_Common.mail_display.action-bar')
  const params = useParams() as {
    account: string
    folder: string
    mail_id: string
  }
  const { folder, mail_id } = params

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

  const mainActions = [
    { icon: <Archive size={18} />, title: t('archive.string') },
    { icon: <Trash2 size={18} />, title: t('delete.string') },
    { icon: <Flame size={18} />, title: t('report_spam.string') },
    { icon: <Mail size={18} />, title: t('mark_unread.string') },
    { icon: <Tag size={18} />, title: t('label.string') },
    { icon: <MoreHorizontal size={18} />, title: t('more.string') },
  ]

  const navigationActions = [
    { icon: <ChevronLeft size={18} />, title: t('previous-mail.string') },
    { icon: <ChevronRight size={18} />, title: t('next-mail.string') },
  ]

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-2">
        <MailReturnButton folderPath={folder} />
        <MailActionsBar actions={mainActions} />
        <div className="ml-auto">
          <MailActionsBar actions={navigationActions} />
        </div>
      </div>
      <MailSubject subject={subject} />
      <div className="h-screen w-full rounded-lg border p-4 shadow sm:p-6">
        <MailHeader
          from={from}
          to={to}
          cc={cc}
          showUnsubscribeButton={!!isMailingList}
          date={date}
        />
      </div>
    </div>
  )
}

export default MailPage
