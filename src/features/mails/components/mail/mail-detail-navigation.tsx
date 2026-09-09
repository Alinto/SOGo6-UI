'use client'

import { TooltipButton } from '@/components/ui/buttons/tooltip-button'
import { useMailDetailNavigation } from '@/features/mails/hooks/use-mail-detail-navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

type MailDetailNavigationProps = {
  showPosition?: boolean
}

const MailDetailNavigation: React.FC<MailDetailNavigationProps> = ({
  showPosition = false,
}) => {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const {
    isActive,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    currentPosition,
    totalInPage,
  } = useMailDetailNavigation()

  if (!isActive) return null

  return (
    <div className="flex items-center">
      <TooltipButton
        variant="outline"
        size="icon"
        onClick={goPrev}
        disabled={!canGoPrev}
        aria-label={t('previous-mail.string')}
        tooltip={t('previous-mail.string')}
      >
        <ChevronLeft />
      </TooltipButton>
      {showPosition && currentPosition != null && totalInPage != null && (
        <span className="text-muted-foreground px-2 text-sm whitespace-nowrap">
          {/* eslint-disable-next-line react/jsx-no-literals */}
          {`${currentPosition} / ${totalInPage}`}
        </span>
      )}
      <TooltipButton
        variant="outline"
        size="icon"
        onClick={goNext}
        disabled={!canGoNext}
        aria-label={t('next-mail.string')}
        tooltip={t('next-mail.string')}
      >
        <ChevronRight />
      </TooltipButton>
    </div>
  )
}

export default MailDetailNavigation
