import { z } from 'zod'
import type { CalendarAddFormData } from './calendar-form-types'

// Re-export the type
export type { CalendarAddFormData }

/** Creation form — only fields accepted by POST /calendars */
export const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    description: z.string().max(500).optional(),
  })
  .transform((data) => ({
    ...data,
    description: data.description || '',
  }))
