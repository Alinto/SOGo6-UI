'use client'

import { createLazyImport } from '@/components/lazy-components'

// Loading component for the calendar
const CalendarLoader = () => {
  //   const loadingText = 'Loading calendar...'
  return (
    <div className="bg-muted/50 flex min-h-[300px] items-center justify-center rounded-lg border p-4">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        {/* <p className="text-muted-foreground text-sm">{loadingText}</p> */}
      </div>
    </div>
  )
}

// Lazy load the actual calendar component
const LazyCalendar = createLazyImport(
  () => import('./calendar-core'),
  <CalendarLoader />
)

// Export the lazy-loaded calendar with the same interface
export type { CalendarProps } from './calendar-core'
export { LazyCalendar as Calendar }
