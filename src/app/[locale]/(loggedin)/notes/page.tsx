'use client'

import { Construction } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NotesPage() {
  const t = useTranslations('NAVIGATION.fast_access.coming_soon')

  return (
    <div className="text-muted-foreground flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <Construction className="size-10 shrink-0 opacity-40" aria-hidden />
      <p className="text-foreground text-sm font-medium">{t('title')}</p>
      <p className="max-w-md text-xs">{t('description')}</p>
    </div>
  )
}
