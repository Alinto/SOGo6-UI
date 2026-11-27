'use client'

import MailLabelBadge from '@/features/mails/components/mail/mail-label-badge'
import { useMailListLabelFilter } from '@/features/mails/hooks/use-mail-list-label-filter'
import { useMailActionMutation } from '@/features/mails/store/mails-api'
import { matchMailLabels } from '@/features/mails/utils/match-mail-labels'
import { useGetUserPreferencesQuery } from '@/features/user-settings/store/user-preferences-api'
import { usePathname } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export type MailSubjectLabelsProps = {
  accountId: string
  folder: string
  mailId: string
  flags?: string[]
  /** Whether the mail list is shown next to the mail (classic / split
   *  layout): a label click then keeps the mail open. */
  listVisible?: boolean
}

export default function MailSubjectLabels({
  accountId,
  folder,
  mailId,
  flags = [],
  listVisible = false,
}: MailSubjectLabelsProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const tCategories = useTranslations('US_MAIL_CATEGORY_LABELS')
  const { data } = useGetUserPreferencesQuery()
  const [mailAction] = useMailActionMutation()
  const pathname = usePathname()
  const { select: selectLabel } = useMailListLabelFilter()

  const categories = useMemo(
    () => data?.data.USER_MAIL_CATEGORY_SETTINGS?.SOGO_U_MAIL_CATEGORIES ?? [],
    [data]
  )

  const labels = useMemo(
    () => matchMailLabels(flags, categories),
    [flags, categories]
  )

  if (labels.length === 0) return null

  const handleRemove = (name: string) => {
    void mailAction({
      accountId,
      folder,
      mailId,
      action: 'untag',
      data: [name],
    })
  }

  // Selects the label in the quick label filter of the list, next to the
  // labels and other quick filters already chosen (a match:any search
  // becomes a match:all one, see useMailListLabelFilter). With the list
  // beside the mail, the mail stays open (it has the label, so it stays
  // listed); otherwise the click goes back to the list it was opened from.
  const handleLabelClick = (name: string) => {
    const mailSegment = pathname.endsWith(`/${encodeURIComponent(mailId)}`)
      ? `/${encodeURIComponent(mailId)}`
      : pathname.endsWith(`/${mailId}`)
        ? `/${mailId}`
        : ''
    const path =
      listVisible || !mailSegment
        ? pathname
        : pathname.slice(0, -mailSegment.length)
    selectLabel(name, path)
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {labels.map((label) => (
        <MailLabelBadge
          key={label.name}
          name={label.name}
          color={label.color}
          displayName={
            label.is_default ? tCategories(`labels.${label.name}`) : label.name
          }
          onRemove={handleRemove}
          removeAriaLabel={t('label_dialog.remove_tag.string', {
            name: label.name,
          })}
          onClick={handleLabelClick}
          clickAriaLabel={t('label_dialog.search_by_tag.string', {
            name: label.name,
          })}
        />
      ))}
    </div>
  )
}
