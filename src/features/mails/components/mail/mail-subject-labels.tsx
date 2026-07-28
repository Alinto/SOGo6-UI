'use client'

import { Badge } from '@/components/ui/badge'
import { useMailActionMutation } from '@/features/mails/store/mails-api'
import { useGetUserPreferencesQuery } from '@/features/user-settings/store/user-preferences-api'
import { X } from 'lucide-react'
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
  const { data } = useGetUserPreferencesQuery()
  const [mailAction] = useMailActionMutation()

  const categories = useMemo(
    () => data?.data.USER_MAIL_CATEGORY_SETTINGS?.SOGO_U_MAIL_CATEGORIES ?? [],
    [data]
  )

  const labels = useMemo(() => {
    const byName = new Map(
      categories.map((category) => [category.name.toLowerCase(), category])
    )
    return flags
      .map((flag) => byName.get(flag.toLowerCase()))
      .filter((category): category is NonNullable<typeof category> =>
        Boolean(category)
      )
  }, [flags, categories])

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

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {labels.map((label) => (
        <Badge
          key={label.name}
          variant="outline"
          className="gap-1 rounded-full py-0.5 pr-1 font-normal"
          style={{
            borderColor: `color-mix(in srgb, ${label.color} 15%, white)`,
            backgroundColor: `color-mix(in srgb, ${label.color} 15%, white)`,
          }}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: label.color }}
            aria-hidden="true"
          />
          {label.name}
          <button
            type="button"
            onClick={() => handleRemove(label.name)}
            aria-label={t('label_dialog.remove_tag.string', {
              name: label.name,
            })}
            className="hover:bg-muted ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}
