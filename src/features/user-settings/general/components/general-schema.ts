'use client'
import { z, ZodObject, ZodType } from 'zod'
import { GeneralSettings } from '../general-types'

type GeneralSettingsSchema = ZodObject<{
  [K in keyof Partial<GeneralSettings>]: K extends keyof GeneralSettings
    ? ZodType<GeneralSettings[K]>
    : never
}>

const schema = z.object({
  language: z.string(),
  timezone: z.string(),
  shortDateStyle: z.string(),
  longDateStyle: z.string(),
  timeStyle: z.string(),
  defaultView: z.string(),
  refreshFrequency: z.string(),
  enableNotifications: z.boolean(),
  animationLevel: z.string(),
}) satisfies GeneralSettingsSchema

export { schema }
