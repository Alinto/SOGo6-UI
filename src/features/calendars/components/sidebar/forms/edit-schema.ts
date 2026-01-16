import { z } from 'zod'
import type { CalendarEditFormData } from './calendar-form-types'

export type { CalendarEditFormData }

export const schema = z.object({
  id: z.string().min(1, 'Calendar ID is required'),
  name: z
    .string()
    .min(1, 'Calendar name is required')
    .max(255, 'Calendar name must be less than 255 characters'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  eventDuration: z.string(),
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
