// components/ui/help-tooltip.tsx
'use client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface HelpTooltipProps {
  message: string
  className?: string
}

export function HelpTooltip({ message, className }: HelpTooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <HelpCircle
            className={cn('text-muted-foreground h-4 w-4', className)}
            onClick={() => setOpen((prev) => !prev)}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
