import { TooltipButton } from '@/components/ui/buttons/tooltip-button'
import { cn } from '@/lib/utils'
import React from 'react'
import { MailActionsBarProps } from './types'

export default function MailActionsBar({
  actions,
  className = '',
  compact = false,
  onAction,
}: MailActionsBarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border shadow-sm',
        compact ? 'h-8 px-1' : 'px-1 py-1',
        className
      )}
    >
      {actions.map((action, idx) => (
        <React.Fragment key={action.title || idx}>
          {idx !== 0 && (
            <div
              className={cn('bg-muted mx-1 w-px', compact ? 'h-5' : 'h-6')}
              aria-hidden="true"
            />
          )}
          <TooltipButton
            variant="ghost"
            size="icon"
            className={compact ? 'h-8 w-8' : undefined}
            tooltip={action.title}
            disabled={action.disabled}
            onClick={
              action.disabled
                ? undefined
                : onAction
                  ? () => onAction(idx, action)
                  : undefined
            }
            data-testid={
              action.title
                ? `mail-action-btn-${action.title?.toLowerCase().replace(/\s/g, '-')}`
                : undefined
            }
          >
            {action.icon}
          </TooltipButton>
        </React.Fragment>
      ))}
    </div>
  )
}
