'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar-lazy'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

export interface CalendarDayDatePickerProps {
  date: Date
  onDateSelect: (date: Date) => void
  className?: string
  label?: ReactNode
}

export function CalendarDayDatePicker({
  date,
  onDateSelect,
  className,
  label,
}: CalendarDayDatePickerProps) {
  const t = useTranslations('CALENDARS.toolbar')
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 leading-none [&>*:first-child]:leading-none',
        className
      )}
    >
      {label}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 p-0 -translate-y-px [&_svg]:size-4"
            aria-label={t('pickDate.string')}
          >
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => {
              if (!selected) return
              onDateSelect(selected)
              setOpen(false)
            }}
            defaultMonth={date}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
