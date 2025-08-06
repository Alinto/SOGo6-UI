import { TooltipButton } from '@/components/ui/buttons/tooltip-button'
import { cn } from '@/lib/utils'
import React from 'react'
import { MailActionsBarProps } from './types'

export default function MailActionsBar({
  actions,
  className = '',
  onAction,
}: MailActionsBarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-1 shadow-sm',
        className
      )}
    >
      {actions.map((action, idx) => (
        <React.Fragment key={action.title || idx}>
          {idx !== 0 && (
            <div className="bg-muted mx-1 h-6 w-px" aria-hidden="true" />
          )}
          <TooltipButton
            variant="ghost"
            size="icon"
            tooltip={action.title}
            onClick={onAction ? () => onAction(idx, action) : undefined}
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
