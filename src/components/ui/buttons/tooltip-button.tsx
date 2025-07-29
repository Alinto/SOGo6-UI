import { Button, ButtonProps } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import React from 'react'

type TooltipButtonProps = ButtonProps & {
  tooltip?: React.ReactNode
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
}

export const TooltipButton = React.forwardRef<
  HTMLButtonElement,
  TooltipButtonProps
>(({ tooltip, tooltipSide = 'bottom', children, ...props }, ref) =>
  tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button ref={ref} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
    </Tooltip>
  ) : (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  )
)

TooltipButton.displayName = 'TooltipButton'
