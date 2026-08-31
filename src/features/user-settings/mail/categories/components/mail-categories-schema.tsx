'use client'
import { MailCategoriesSettings } from '@/features/user-settings/store/user-preferences-types'
import { useTranslations } from 'next-intl'
import { z, ZodObject, ZodType } from 'zod'

type MailCategoriesSchema = ZodObject<{
  [K in keyof Partial<MailCategoriesSettings>]: K extends keyof MailCategoriesSettings
    ? ZodType<MailCategoriesSettings[K]>
    : never
}>

const createSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    categories: z.array(
      z.object({
        name: z
          .string()
          .min(1, t('labels.validation.label-name-required')),
        color: z.string(),
        isDefault: z.boolean(),
      })
    ),
  }) satisfies MailCategoriesSchema

export { createSchema }
