'use client'
import { CalendarCategoriesSettings } from '@/features/user-settings/store/user-preferences-types'
import { z, ZodObject, ZodType } from 'zod'

type CalendarCategoriesSchema = ZodObject<{
  [K in keyof Partial<CalendarCategoriesSettings>]: K extends keyof CalendarCategoriesSettings
    ? ZodType<CalendarCategoriesSettings[K]>
    : never
}>

const schema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      color: z.string(),
      isDefault: z.boolean(),
    })
  ),
}) satisfies CalendarCategoriesSchema

export { schema }
