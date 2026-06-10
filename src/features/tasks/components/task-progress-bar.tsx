'use client'

import {
  taskProgressFillClass,
  taskProgressTrackClass,
} from '@/features/tasks/components/task-progress-styles'
import { cn } from '@/lib/utils'
import { memo } from 'react'

type TaskProgressBarProps = {
  value: number
  showLabel?: boolean
  className?: string
  barClassName?: string
}

function TaskProgressBar({
  value,
  showLabel = true,
  className,
  barClassName,
}: TaskProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn('flex min-w-0 items-center gap-2', className)}
      data-testid="task-progress-bar"
    >
      <div
        className={cn(
          'h-1.5 min-w-0 flex-1 overflow-hidden rounded-full',
          taskProgressTrackClass,
          barClassName
        )}
      >
        <div
          className={cn('h-full rounded-full transition-[width]', taskProgressFillClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-muted-foreground shrink-0 text-[10px] font-medium tabular-nums">
          {pct}%
        </span>
      )}
    </div>
  )
}

export default memo(TaskProgressBar)
