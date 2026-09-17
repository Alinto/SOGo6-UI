'use client'

import MailLabelBadge from '@/features/mails/components/mail/mail-label-badge'
import { clearMailSearch } from '@/features/mails/store/mail-search-slice'
import { useMailActionMutation } from '@/features/mails/store/mails-api'
import { buildAdvancedSearchPath } from '@/features/mails/utils/mail-search-form'
import { matchMailLabels } from '@/features/mails/utils/match-mail-labels'
import { useGetUserPreferencesQuery } from '@/features/user-settings/store/user-preferences-api'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export type MailSubjectLabelsProps = {
  accountId: string
  folder: string
  mailId: string
  flags?: string[]
}

export default function MailSubjectLabels({
  accountId,
  folder,
  mailId,
  flags = [],
}: MailSubjectLabelsProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const tCategories = useTranslations('US_MAIL_CATEGORY_LABELS')
  const { data } = useGetUserPreferencesQuery()
  const [mailAction] = useMailActionMutation()
  const router = useRouter()
  const dispatch = useAppDispatch()

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

  const handleLabelClick = (name: string) => {
    // Any simple/advanced search already active (e.g. the one this mail was
    // opened from) must not linger — the label click starts a fresh search,
    // not a refinement of the previous one.
    dispatch(clearMailSearch())
    router.push(buildAdvancedSearchPath(accountId, { labels: [name] }))
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
