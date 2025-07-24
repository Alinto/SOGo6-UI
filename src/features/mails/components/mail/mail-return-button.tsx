import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
}: MailReturnButtonProps) {
  const { push } = useRouter()
  const { account } = useParams()
  const t = useTranslations('Mails_Common.mail_display.action-bar')

  const handleClick = React.useCallback(() => {
    push(`/u/${account}/${encodeURIComponent(folderPath)}`)
  }, [account, folderPath, push])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          onClick={handleClick}
        >
          <ArrowLeft size={20} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip ?? t('return.string')}</TooltipContent>
    </Tooltip>
  )
}
