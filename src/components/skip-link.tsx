'use client'

import { useTranslations } from 'next-intl'

export function SkipLink() {
  const t = useTranslations('COMMONS')
  return (
    <a
      href="#main-content"
      className="bg-background text-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:ring-2"
    >
      {t('skip_to_content.string')}
    </a>
  )
}
