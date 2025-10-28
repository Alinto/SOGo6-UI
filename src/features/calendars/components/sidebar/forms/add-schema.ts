import { z } from 'zod'

export interface CalendarAddFormData {
  name: string
  color: string
  description?: string
  eventDuration: string
  eventNotifications?: Array<{
    type: string
    timing: string
  }>
  allDayNotifications?: Array<{
    type: string
    timing: string
  }>
  showBusyStatus: boolean
}

export const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    description: z.string().max(500).optional(),
    eventDuration: z.string().min(1),
    eventNotifications: z
      .array(
        z.object({
          type: z.string(),
          timing: z.string(),
        })
      )
      .optional(),
    allDayNotifications: z
      .array(
        z.object({
          type: z.string(),
          timing: z.string(),
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
