import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import React from 'react'
import { MailActionsBarProps } from './types'

export default function MailActionsBar({
  actions,
  className = '',
  onAction,
}: MailActionsBarProps) {
  return (
    <div
      className={`inline-flex items-center rounded-md border px-2 py-1 shadow-sm ${className}`}
    >
      {actions.map((action, idx) => (
        <React.Fragment key={action.title || idx}>
          {idx !== 0 && (
            <div className="bg-muted mx-1 h-6 w-px" aria-hidden="true" />
          )}
          {action.title ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAction ? () => onAction(idx, action) : undefined}
                  data-testid={`mail-action-btn-${action.title?.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {action.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{action.title}</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onAction ? () => onAction(idx, action) : undefined}
            >
              {action.icon}
            </Button>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
