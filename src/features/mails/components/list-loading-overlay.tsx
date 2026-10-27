'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'

interface ListLoadingOverlayProps {
  className?: string
}

/**
 * Spinner shown on top of the mail list while messages are fetched from the
 * API. The parent must be `relative`. Does not block scrolling or clicks.
 */
const ListLoadingOverlay: React.FC<ListLoadingOverlayProps> = ({
  className,
}) => {
  const t = useTranslations('MAILS_LIST')

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none absolute inset-0 z-10 flex items-center justify-center',
        className
      )}
    >
      <Loader2
        aria-hidden="true"
        className="text-primary h-8 w-8 animate-spin"
      />
      <span className="sr-only">{t('loading.string')}</span>
    </div>
  )
}

export default memo(ListLoadingOverlay)
