'use client'

import {
  taskProgressFillClass,
  taskProgressTrackClass,
} from '@/features/tasks/components/task-progress-styles'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { memo, useId } from 'react'

const rangeThumbClasses = cn(
  'accent-primary relative z-10 h-6 w-full min-w-0 cursor-pointer appearance-none bg-transparent',
  '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent',
  '[&::-webkit-slider-thumb]:-mt-[3px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm',
  '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent',
  '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-sm'
)

type TaskProgressFieldProps = {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

function TaskProgressField({
  value,
  onChange,
  disabled,
  className,
}: TaskProgressFieldProps) {
  const t = useTranslations('TASKS')
  const id = useId()
  const pct = Math.min(100, Math.max(0, value ?? 0))

  return (
    <div
      className={cn('flex items-center gap-3', className)}
      data-testid="task-progress-field"
    >
      <label htmlFor={id} className="shrink-0 text-sm font-medium">
        {t('form.percent_complete.string')}
      </label>

      <div className="relative flex h-6 min-w-0 flex-1 items-center">
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 h-2 overflow-hidden rounded-full',
            taskProgressTrackClass
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-150 ease-out',
              taskProgressFillClass
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={5}
          value={pct}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            rangeThumbClasses,
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={t('form.percent_complete.string')}
        />
      </div>

      <span className="text-muted-foreground w-10 shrink-0 text-right text-sm font-medium tabular-nums">
        {pct}%
      </span>
    </div>
  )
}

export default memo(TaskProgressField)
