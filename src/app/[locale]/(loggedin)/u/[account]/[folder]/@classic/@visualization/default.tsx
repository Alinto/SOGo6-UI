'use client'

import { useTranslations } from 'next-intl'
import { Mail } from 'lucide-react'
import React from 'react'

export default function Default() {
  const t = useTranslations('MAILS_LIST')
  return (
    <div className="text-muted-foreground flex h-full w-full select-none flex-col items-center justify-center gap-4">
      <div className="bg-muted rounded-full p-6">
        <Mail className="h-10 w-10 opacity-40" />
      </div>
      <p className="text-sm font-medium opacity-50">{t('select_message.string')}</p>
    </div>
  )
}
