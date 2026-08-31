'use client'

import MailLabelBadge from '@/features/mails/components/mail/mail-label-badge'
import { matchMailLabels } from '@/features/mails/utils/match-mail-labels'
import { useGetUserPreferencesQuery } from '@/features/user-settings/store/user-preferences-api'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export type MailListLabelsProps = {
  flags?: string[]
}

export default function MailListLabels({ flags = [] }: MailListLabelsProps) {
  const tCategories = useTranslations('US_MAIL_CATEGORY_LABELS')
  const { data } = useGetUserPreferencesQuery()

  const categories = useMemo(
    () => data?.data.USER_MAIL_CATEGORY_SETTINGS?.SOGO_U_MAIL_CATEGORIES ?? [],
    [data]
  )

  const labels = useMemo(
    () => matchMailLabels(flags, categories),
    [flags, categories]
  )

  if (labels.length === 0) return null

  return (
    <span className="flex shrink-0 items-center gap-1">
      {labels.map((label) => (
        <MailLabelBadge
          key={label.name}
          name={label.name}
          color={label.color}
          displayName={
            label.is_default
              ? tCategories(`labels.${label.name}`)
              : label.name
          }
          size="sm"
        />
      ))}
    </span>
  )
}
