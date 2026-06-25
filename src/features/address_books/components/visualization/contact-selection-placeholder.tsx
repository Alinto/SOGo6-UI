'use client'

import { UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

function ContactSelectionPlaceholder() {
  const t = useTranslations('CONTACT_FORM')

  return (
    <div
      data-testid="contact-selection-placeholder"
      className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <div className="bg-muted/40 flex h-14 w-14 items-center justify-center rounded-full">
        <UserRound className="h-6 w-6 opacity-60" />
      </div>
      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">
          {t('selection_placeholder.title.string')}
        </p>
        <p className="max-w-xs text-xs">{t('selection_placeholder.description.string')}</p>
      </div>
    </div>
  )
}

export default memo(ContactSelectionPlaceholder)
