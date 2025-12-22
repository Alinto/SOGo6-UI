import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { ContactBadge } from './mail-contact-badge'
import { UnsubscribeDialog } from './mail-unsubscribe-dialog'
import { MailHeaderFullProps } from './types'
import { formatMailTime } from './utils'

export default function MailHeaderMobile({
  from,
  to,
  cc,
  showUnsubscribeButton,
  date,
}: MailHeaderFullProps) {
  const t = useTranslations('Mails_Common')
  const [open, setOpen] = useState(false)
  const [expandRecipients, setExpandRecipients] = useState(false)

  const totalTo = to.length
  const totalCc = cc?.length ?? 0

  const formattedTime = formatMailTime(date)

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Header top: Avatar + From + Date + Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src="/images/account-avatar.svg" />
            <AvatarFallback>
              {from.name?.[0]?.toUpperCase() || from.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <ContactBadge contact={from} />
            </div>
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {formattedTime}
            </span>
          </div>
        </div>
        {/* Actions on the right
        <div className="flex shrink-0">
          <MailActionsBar actions={rightActions} />
        </div> */}
      </div>

      {/* Unsubscribe button */}
      {showUnsubscribeButton && (
        <>
          <Button
            variant="ghost"
            className="text-primary h-auto w-fit cursor-pointer rounded-full px-2 py-1 text-xs"
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

      {/* Recipients Summary (Collapsed) */}
      {!expandRecipients && (
        <Button
          variant="ghost"
          className="text-muted-foreground ml-3 h-auto w-fit justify-start gap-1 px-0 py-1 text-xs font-normal hover:bg-transparent"
          onClick={() => setExpandRecipients(true)}
        >
          <ChevronDown className="h-6 w-6 shrink-0" />
          to{' '}
          <span className="text-foreground truncate">
            {to[0]?.name || to[0]?.email}
          </span>
          {totalTo > 1 && (
            <span className="text-foreground">+{totalTo - 1}</span>
          )}
          {totalCc > 0 && <span>cc</span>}
        </Button>
      )}

      {/* Recipients Expanded */}
      {expandRecipients && (
        <div className="flex flex-col gap-2">
          {/* To Recipients */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold">To</span>
            <div className="flex flex-wrap items-center gap-1">
              {to.map((contact, idx) => (
                <ContactBadge contact={contact} key={contact.email + idx} />
              ))}
            </div>
          </div>

          {/* CC Recipients */}
          {totalCc > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold">Cc</span>
              <div className="flex flex-wrap items-center gap-1">
                {cc!.map((contact, idx) => (
                  <ContactBadge contact={contact} key={contact.email + idx} />
                ))}
              </div>
            </div>
          )}

          {/* Collapse button */}
          <Button
            variant="ghost"
            className="text-muted-foreground h-auto w-fit justify-start gap-1 px-0 py-1 text-xs hover:bg-transparent"
            onClick={() => setExpandRecipients(false)}
          >
            <ChevronUp className="h-6 w-6 shrink-0" />
          </Button>
        </div>
      )}

      {/* Actions */}
    </div>
  )
}
