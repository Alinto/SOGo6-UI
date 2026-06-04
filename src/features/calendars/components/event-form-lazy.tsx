'use client'

import { createDynamicComponent } from '@/components/dynamic-imports'
import { FormLoader } from '@/components/lazy-components'
import type { EventFormProps } from '@/features/calendars/components/event-form'

export type { EventFormProps as LazyEventFormProps }

export const LazyEventForm = createDynamicComponent<EventFormProps>(
  () =>
    import('@/features/calendars/components/event-form').then((mod) => ({
      default: mod.EventForm,
    })),
  {
    loading: () => <FormLoader />,
    ssr: false,
  }
)
