import { cn } from '@/lib/utils'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import React from 'react'

interface TagProps {
  value: string
  icon?: IconName
  action?: () => void
  className?: string
  'aria-label'?: string
  'data-testid'?: string
}

const Tag: React.FC<TagProps> = ({
  value,
  action,
  icon,
  className,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}) => {
  return (
    <div
      className={cn(
        'tag bg-muted flex h-9 items-center rounded-full text-sm',
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
          className="text-muted-foreground hover:text-foreground flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors"
        >
          <DynamicIcon size="16" name={icon} />
        </button>
      )}
    </div>
  )
}

export default Tag
