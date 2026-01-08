import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Forward, Reply, ReplyAll } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import MailActionsBar from './mail-action-bar'
import { ContactBadge } from './mail-contact-badge'
import { UnsubscribeDialog } from './mail-unsubscribe-dialog'
import { MailHeaderFullProps, RightActionsType } from './types'
import { formatMailTime } from './utils'

const MAX_DISPLAY_TO = 5
const MAX_DISPLAY_CC = 5

export default function MailHeader({
  from,
  to,
  cc,
  showUnsubscribeButton,
  date,
}: MailHeaderFullProps) {
  const t = useTranslations('MAILS_COMMONS')
  const [open, setOpen] = useState(false)
  const [showAllTo, setShowAllTo] = useState(false)
  const [showAllCc, setShowAllCc] = useState(false)

  const totalTo = to.length
  const hiddenTo = totalTo - MAX_DISPLAY_TO
  const displayedTo = showAllTo ? to : to.slice(0, MAX_DISPLAY_TO)

  const hiddenCc = (cc?.length ?? 0) - MAX_DISPLAY_CC
  const displayedCc = showAllCc
    ? (cc ?? [])
    : (cc ?? []).slice(0, MAX_DISPLAY_CC)
  const plusUndisplayElement = '+'

  const formattedTime = formatMailTime(date)

  const rightActions: RightActionsType = [
    {
      icon: <Reply size={18} />,
      title: t('mail_display.action-bar.reply.string'),
    },
    {
      icon: <ReplyAll size={18} />,
      title: t('mail_display.action-bar.reply_all.string'),
    },
    {
      icon: <Forward size={18} />,
      title: t('mail_display.action-bar.forward.string'),
    },
  ]

  return (
    <div className="mb-3 flex w-full items-start justify-between gap-4">
      {/* Avatar à gauche, aligné en haut */}
      <div className="flex flex-col items-start">
        <Avatar className="h-12 w-12">
          <AvatarImage src="/images/account-avatar.svg" />
          <AvatarFallback>
            {from.name?.[0]?.toUpperCase() || from.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Bloc infos à droite de l'avatar */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold">From</span>
          <ContactBadge contact={from} />
          {showUnsubscribeButton && (
            <>
              <Button
                variant="ghost"
                className="text-primary h-auto min-w-0 cursor-pointer rounded-full px-2 py-1 text-sm"
                type="button"
                tabIndex={0}
                onClick={() => setOpen(true)}
              >
                {t('mail_display.header.unsubscribe.string')}
              </Button>
              <UnsubscribeDialog
                open={open}
                onOpenChange={setOpen}
                senderName={from.name}
                senderEmail={from.email}
              />
            </>
          )}
        </div>
        {/* To */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold">To</span>
          {displayedTo.map((contact, idx) => (
            <ContactBadge contact={contact} key={contact.email + idx} />
          ))}
          {!showAllTo && hiddenTo > 0 && (
            <Button
              variant="ghost"
              className="bg-muted h-auto min-w-0 cursor-pointer rounded border px-3 py-1 text-xs shadow-none"
              type="button"
              tabIndex={0}
              onClick={() => setShowAllTo(true)}
            >
              {plusUndisplayElement}
              {hiddenTo}
            </Button>
          )}
        </div>
        {/* CC */}
        {cc?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold">Cc</span>
            {displayedCc.map((contact, idx) => (
              <ContactBadge contact={contact} key={contact.email + idx} />
            ))}
            {!showAllCc && hiddenCc > 0 && (
              <Button
                variant="ghost"
                className="bg-muted h-auto min-w-0 cursor-pointer rounded border px-3 py-1 text-xs shadow-none"
                type="button"
                tabIndex={0}
                onClick={() => setShowAllCc(true)}
              >
                {plusUndisplayElement}
                {hiddenCc}
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Bloc droit : date & actions */}
      <div className="flex min-w-fit flex-row items-center gap-4">
        <span className="text-muted-foreground text-sm whitespace-nowrap">
          {formattedTime}
        </span>
        <MailActionsBar actions={rightActions} />
      </div>
    </div>
  )
}
