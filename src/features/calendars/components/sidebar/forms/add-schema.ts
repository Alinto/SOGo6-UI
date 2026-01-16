import { z } from 'zod'
import type { CalendarAddFormData } from './calendar-form-types'

// Re-export the type
export type { CalendarAddFormData }

export const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    description: z.string().max(500).optional(),
    eventDuration: z.string().min(1),
    eventNotifications: z
      .array(
        z.object({
          type: z.enum(['notification', 'email']),
          timing: z.string(),
        })
      )
      .optional(),
    allDayNotifications: z
      .array(
        z.object({
          type: z.enum(['notification', 'email']),
          daysBefore: z.number().min(0, 'Days must be 0 or greater'),
          time: z
            .string()
            .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
        })
      )
      .optional(),
    showBusyStatus: z.boolean(),
  })
  .transform((data) => ({
    ...data,
    description: data.description || '',
    showBusyStatus: data.showBusyStatus ?? false,
  }))
