'use client'
import { useTranslations } from 'next-intl'
import { z, ZodObject, ZodType } from 'zod'
import { ContactGeneralSettings } from '../../store/user-preferences-types'

type ContactsSettingsSchema = ZodObject<{
  [K in keyof Partial<ContactGeneralSettings>]: K extends keyof ContactGeneralSettings
    ? ZodType<ContactGeneralSettings[K]>
    : never
}>

const createSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    categories: z.array(
      z.object({
        name: z.string().min(1, t('validation.category-name-required')),
        color: z.string(),
        isDefault: z.boolean(),
      })
    ),
    creationNotification: z.boolean(),
  }) satisfies ContactsSettingsSchema

export { createSchema }
