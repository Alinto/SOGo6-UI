import { TooltipButton } from '@/components/ui/buttons/tooltip-button'
import { useRouter } from '@/lib/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'
import { MailReturnButtonProps } from './types'

export function MailReturnButton({
  folderPath,
  tooltip,
  className = '',
  onBack,
}: MailReturnButtonProps) {
  const { push } = useRouter()
  const { account } = useParams()
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')

  const handleClick = React.useCallback(() => {
    if (onBack) {
      onBack()
      return
    }
    push(`/u/${account}/${encodeURIComponent(folderPath)}`)
  }, [account, folderPath, onBack, push])

  return (
    <TooltipButton
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleClick}
      tooltip={tooltip ?? t('return.string')}
    >
      <ArrowLeft size={20} />
    </TooltipButton>
  )
}
