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

function hasAccessibleText(node: React.ReactNode): boolean {
  if (typeof node === 'string') return node.trim().length > 0
  if (typeof node === 'number') return true
  if (Array.isArray(node)) return node.some(hasAccessibleText)
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return hasAccessibleText(node.props.children)
  }
  return false
}

export const TooltipButton = React.forwardRef<
  HTMLButtonElement,
  TooltipButtonProps
>(({ tooltip, tooltipSide = 'bottom', children, ...props }, ref) => {
  const { 'aria-label': ariaLabel, ...rest } = props
  const tooltipName =
    typeof tooltip === 'string' &&
    tooltip.trim().length > 0 &&
    !hasAccessibleText(children)
      ? tooltip
      : undefined

  const button = (
    <Button ref={ref} {...rest} aria-label={ariaLabel ?? tooltipName}>
      {children}
    </Button>
  )

  if (!tooltip) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
    </Tooltip>
  )
})

TooltipButton.displayName = 'TooltipButton'
