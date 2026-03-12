'use client'
import { CalendarCategoriesSettings } from '@/features/user-settings/store/user-preferences-types'
import { useTranslations } from 'next-intl'
import { z, ZodObject, ZodType } from 'zod'

type CalendarCategoriesSchema = ZodObject<{
  [K in keyof Partial<CalendarCategoriesSettings>]: K extends keyof CalendarCategoriesSettings
    ? ZodType<CalendarCategoriesSettings[K]>
    : never
}>

const createSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    categories: z.array(
      z.object({
        name: z
          .string()
          .min(1, t('categories.validation.category-name-required')),
        color: z.string(),
        isDefault: z.boolean(),
      })
    ),
  }) satisfies CalendarCategoriesSchema

export { createSchema }
