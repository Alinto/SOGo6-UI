'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function DemoWarningToast() {
  const t = useTranslations('COMMON')

  useEffect(() => {
    // Show toast after 1 second
    const timer = setTimeout(() => {
      toast.warning(`⚠️ ${t('demo.warning.title.string')}`, {
        description: t('demo.warning.description.string'),
        duration: 10000, // 10 secondes
        action: {
          label: t('demo.warning.action.string'),
          onClick: () => toast.dismiss(),
        },
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [t])

  return null
}
