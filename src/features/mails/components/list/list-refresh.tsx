'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useCallback } from 'react'

interface ListRefreshProps {
  onRefresh: () => void
  isRefreshing?: boolean
}

const ListRefresh: React.FC<ListRefreshProps> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  const t = useTranslations('MAILS_LIST')
  const label = t('refresh.string')

  const handleClick = useCallback(() => {
    if (isRefreshing) return
    onRefresh()
  }, [isRefreshing, onRefresh])

  // aria-disabled rather than disabled: keeps keyboard focus on the button.
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-foreground hover:text-foreground h-8 w-8 hover:bg-transparent aria-disabled:cursor-default"
          aria-label={label}
          aria-busy={isRefreshing}
          aria-disabled={isRefreshing}
          onClick={handleClick}
        >
          <RefreshCw
            data-testid="list-refresh-icon"
            className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export default memo(ListRefresh)
