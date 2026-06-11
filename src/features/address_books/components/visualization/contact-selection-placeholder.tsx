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
      <UserRound className="h-12 w-12 opacity-30" />
      <p className="text-sm font-medium">{t('selection_placeholder.title.string')}</p>
      <p className="max-w-xs text-xs">{t('selection_placeholder.description.string')}</p>
    </div>
  )
}

export default memo(ContactSelectionPlaceholder)
