'use client'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import * as React from 'react'

export function BasicCalendar({ className }: { className?: string }) {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 6, 10)
  )
  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={setDate}
      className={cn('rounded-lg border shadow-sm', className)}
    />
  )
}
