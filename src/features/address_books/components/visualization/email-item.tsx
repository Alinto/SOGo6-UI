import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Copy, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useCopyToClipboard } from './hooks/use-copy-to-clipboard'

interface EmailItemProps {
  email: string
}

export function EmailItem({ email }: EmailItemProps) {
  const { copyToClipboard } = useCopyToClipboard()
  const t = useTranslations('CONTACT_FORM')

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    copyToClipboard(email, email)
  }

  return (
    <div className="group hover:bg-accent/50 flex items-center justify-between gap-3 rounded-md p-2 transition-colors">
      <a
        href={`mailto:${email}`}
        className="text-foreground hover:text-primary focus-visible:ring-ring flex min-w-0 flex-1 items-center gap-2 text-sm focus-visible:rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
        tabIndex={0}
      >
        <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
        <span className="truncate">{email}</span>
      </a>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              onClick={handleCopy}
              aria-label={`${t('copy_email.string')} ${email}`}
              tabIndex={0}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('copy_email.string')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
