'use client'

import { SidebarGroupContent } from '@/components/ui/sidebar'
import React from 'react'

import { Calendar } from '@/components/ui/calendar-lazy'
import { cn } from '@/lib/utils'

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

const CalendarContent: React.FC = () => {
  return (
    <SidebarGroupContent>
      <BasicCalendar className="rounded-none" />
      <div className="m-2 mt-4 flex flex-col items-center rounded-lg border-1 p-2 shadow-md">
        <div className="text-muted-foreground">2023-10-01 10:00 AM</div>
        <span className="text-muted-foreground text-xs">
          Appointment with John Doe
        </span>
      </div>
      <div className="m-2 mt-4 flex flex-col items-center rounded-lg border-1 p-2 shadow-md">
        <div className="text-muted-foreground">2023-10-01 10:00 AM</div>
        <span className="text-muted-foreground text-xs">
          Appointment with Filipe Doe
        </span>
      </div>
      <div className="m-2 mt-4 flex flex-col items-center rounded-lg border-1 p-2 shadow-md">
        <div className="text-muted-foreground">2023-10-01 15:00 AM</div>
        <span className="text-muted-foreground text-xs">
          Appointment with Jane Doe
        </span>
      </div>
    </SidebarGroupContent>
  )
}

export default CalendarContent
