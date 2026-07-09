'use client'

import { useTranslations } from 'next-intl'

export function VirtualFolderEmptyState() {
  const t = useTranslations('MAILS_COMMONS.folders.virtual_empty')

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
      <p className="text-base font-medium text-foreground">
        {t('title.string')}
      </p>
      <p className="max-w-md text-sm">{t('description.string')}</p>
    </div>
  )
}
