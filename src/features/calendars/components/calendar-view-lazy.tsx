'use client'

import { createDynamicComponent } from '@/components/dynamic-imports'
import type { CalendarViewProps } from '@/features/calendars/components/calendar-view'
import { CalendarViewLoader } from '@/features/calendars/components/calendar-view-loader'

export type { CalendarViewProps as LazyCalendarViewProps }

export const LazyCalendarView = createDynamicComponent<CalendarViewProps>(
  () => import('@/features/calendars/components/calendar-view'),
  {
    loading: () => <CalendarViewLoader />,
    ssr: false,
  }
)
