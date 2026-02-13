'use client'
import { z, ZodObject, ZodType } from 'zod'
import { ContactGeneralSettings } from '../../store/user-preferences-types'

type ContactsSettingsSchema = ZodObject<{
  [K in keyof Partial<ContactGeneralSettings>]: K extends keyof ContactGeneralSettings
    ? ZodType<ContactGeneralSettings[K]>
    : never
}>

const schema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      color: z.string(),
      canBeTranslated: z.boolean(),
    })
  ),
  creationNotification: z.boolean(),
}) satisfies ContactsSettingsSchema

export { schema }
