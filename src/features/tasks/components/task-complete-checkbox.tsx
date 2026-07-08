'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'

type TaskCompleteCheckboxProps = {
  completed: boolean
  label: string
  onToggle: () => Promise<void>
  disabled?: boolean
}

function TaskCompleteCheckbox({
  completed,
  label,
  onToggle,
  disabled,
}: TaskCompleteCheckboxProps) {
  const [checked, setChecked] = useState(completed)
  const [isPending, setIsPending] = useState(false)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setChecked(completed)
  }, [completed])

  const handleClick = useCallback(async () => {
    if (isPending || disabled) return

    const next = !checked
    setChecked(next)
    setPulse(true)

    setIsPending(true)
    try {
      await onToggle()
    } catch {
      setChecked(!next)
    } finally {
      setIsPending(false)
      window.setTimeout(() => setPulse(false), 350)
    }
  }, [checked, disabled, isPending, onToggle])

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      aria-busy={isPending}
      disabled={disabled || isPending}
      data-testid="task-complete-checkbox"
      onClick={handleClick}
      className={cn(
        'group mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border',
        'transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out',
        'cursor-pointer focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        'active:scale-90',
        (disabled || isPending) && 'cursor-not-allowed',
        checked
          ? 'border-primary bg-primary shadow-sm'
          : 'border-muted-foreground/35 bg-background hover:border-primary/55 hover:bg-primary/5',
        pulse && 'scale-110',
        isPending && 'pointer-events-none'
      )}
    >
      <Check
        className={cn(
          'h-3.5 w-3.5 transition-[color,transform] duration-200 ease-out',
          checked
            ? 'text-primary-foreground'
            : 'text-muted-foreground/35 group-hover:text-primary/55'
        )}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  )
}

export default memo(TaskCompleteCheckbox)
