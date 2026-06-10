import { cn, tagDismissButtonClassName } from '@/lib/utils'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import React from 'react'
import { TooltipProvider, TooltipWrapper } from './tooltip'

interface TagProps {
  value: string
  tooltip?: string
  icon?: IconName
  action?: () => void
  className?: string
  'aria-label'?: string
  'data-testid'?: string
}

const Tag: React.FC<TagProps> = ({
  value,
  tooltip,
  action,
  icon,
  className,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}) => {
  const tag = (
    <div
      className={cn(
        'tag bg-muted flex h-9 max-w-[200px] items-center rounded-full text-sm',
        icon ? 'gap-2 pr-1 pl-3' : 'px-3',
        className
      )}
      role="listitem"
      data-testid={dataTestId}
    >
      <span className="truncate">{value}</span>
      {icon && (
        <button
          type="button"
          onClick={() => action && action()}
          aria-label={ariaLabel}
          className={tagDismissButtonClassName('h-7 w-7')}
        >
          <DynamicIcon size="16" name={icon} />
        </button>
      )}
    </div>
  )

  if (!tooltip) return tag

  return (
    <TooltipProvider>
      <TooltipWrapper content={tooltip} side="top">
        {tag}
      </TooltipWrapper>
    </TooltipProvider>
  )
}

export default Tag
