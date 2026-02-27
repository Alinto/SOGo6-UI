'use client'
import { MailCategoriesSettings } from '@/features/user-settings/store/user-preferences-types'
import { z, ZodObject, ZodType } from 'zod'

type MailCategoriesSchema = ZodObject<{
  [K in keyof Partial<MailCategoriesSettings>]: K extends keyof MailCategoriesSettings
    ? ZodType<MailCategoriesSettings[K]>
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
}) satisfies MailCategoriesSchema

export { schema }
