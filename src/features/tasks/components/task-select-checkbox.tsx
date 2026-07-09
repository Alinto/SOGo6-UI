'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { memo, type MouseEvent } from 'react'

export const taskSelectCheckboxClassName = cn(
  'mt-0.5 h-[22px] w-[22px] rounded-sm shadow-sm',
  'border-muted-foreground/35 bg-background',
  'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
  'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary/10',
  '[&_svg]:h-3.5 [&_svg]:w-3.5'
)

export const TaskSelectCheckboxIndicator = memo(
  function TaskSelectCheckboxIndicator({
    className,
  }: {
    className?: string
  }) {
    return (
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex h-[22px] w-[22px] shrink-0 rounded-sm border border-muted-foreground/35 bg-background shadow-sm',
          className
        )}
      />
    )
  }
)

type TaskSelectCheckboxProps = {
  checked?: boolean | 'indeterminate'
  label: string
  disabled?: boolean
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  className?: string
  'data-testid'?: string
}

function TaskSelectCheckbox({
  checked = false,
  label,
  disabled,
  onCheckedChange,
  onClick,
  className,
  'data-testid': dataTestId,
}: TaskSelectCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      disabled={disabled}
      aria-label={label}
      data-testid={dataTestId}
      onCheckedChange={onCheckedChange}
      onClick={onClick}
      className={cn(taskSelectCheckboxClassName, className)}
    />
  )
}

export default memo(TaskSelectCheckbox)
