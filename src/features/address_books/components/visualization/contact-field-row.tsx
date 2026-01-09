import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useCopyToClipboard } from './hooks/use-copy-to-clipboard'

interface ContactFieldRowProps {
  label?: string
  value: string | string[] | null | undefined
  type?: 'email' | 'phone' | 'url' | 'text'
  showCopy?: boolean
  className?: string
}

export function ContactFieldRow({
  label,
  value,
  type = 'text',
  showCopy = true,
  className,
}: ContactFieldRowProps) {
  const { copyToClipboard } = useCopyToClipboard()
  const t = useTranslations('CONTACT_FORM')

  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null
  }

  const values = Array.isArray(value) ? value : [value]
  const displayValue = values.join(', ')
  const shouldShowLabel = label && label !== displayValue
  const copyLabel = label || displayValue
  const tooltipText = label ? `${t('copy.string')} ${label}` : t('copy.string')

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    copyToClipboard(displayValue, copyLabel)
  }

  const getHref = (val: string) => {
    switch (type) {
      case 'email':
        return `mailto:${val}`
      case 'phone':
        return `tel:${val}`
      case 'url':
        return val.startsWith('http') ? val : `https://${val}`
      default:
        return undefined
    }
  }

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-4 py-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {shouldShowLabel && (
            <dt className="text-muted-foreground text-xs font-medium sm:text-sm">
              {label}
            </dt>
          )}
          <dd className="text-foreground text-sm sm:text-base">
            {values.length === 1 ? (
              <a
                href={getHref(values[0])}
                className="hover:text-primary focus-visible:ring-ring focus-visible:rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
                tabIndex={0}
              >
                {values[0]}
              </a>
            ) : (
              <ul className="flex flex-col gap-1">
                {values.map((val, index) => (
                  <li key={index}>
                    <a
                      href={getHref(val)}
                      className="hover:text-primary focus-visible:ring-ring focus-visible:rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
                      tabIndex={0}
                    >
                      {val}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
        {showCopy && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleCopy}
                  aria-label={tooltipText}
                  tabIndex={0}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
