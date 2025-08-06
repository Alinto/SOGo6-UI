import { Mail as MailIcon, UserPlus2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ContactPopoverContent() {
  const t = useTranslations('Mails_Common')
  const buttonClass =
    'flex cursor-pointer gap-2 rounded px-2 py-1 text-sm hover:bg-muted'

  return (
    <div className="flex flex-col gap-1">
      <button className={buttonClass} type="button" tabIndex={0}>
        <UserPlus2 size={16} className="text-muted-foreground" />
        {t(
          'mail_display.header.contacts-badge.popover-add-to-addressbook.string'
        )}
      </button>
      <button className={buttonClass} type="button" tabIndex={0}>
        <MailIcon size={16} className="text-muted-foreground" />
        {t(
          'mail_display.header.contacts-badge.popover-write-new-message.string'
        )}
      </button>
    </div>
  )
}
