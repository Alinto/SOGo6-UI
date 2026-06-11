import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { createDraft } from '@/features/mails/store'
import { useAppDispatch } from '@/lib/redux/hooks'
import { Copy, Mail, Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useCopyToClipboard } from './hooks/use-copy-to-clipboard'

interface EmailItemProps {
  email: string
  displayName?: string
}

export function EmailItem({ email, displayName }: EmailItemProps) {
  const dispatch = useAppDispatch()
  const { copyToClipboard } = useCopyToClipboard()
  const t = useTranslations('CONTACT_FORM')

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    copyToClipboard(email, email)
  }

  const handleCompose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(
      createDraft({
        id: `compose-${Date.now()}`,
        initialData: {
          to: [{ email, name: displayName }],
        },
      })
    )
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
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCompose}
                aria-label={t('compose_email.string')}
                data-testid={`compose-email-${email}`}
                tabIndex={0}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('compose_email.string')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
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
    </div>
  )
}
