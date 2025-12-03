'use client'
import { z, ZodObject, ZodType } from 'zod'
import { MailVacation } from '../mail-vacation-types'

type VacationMailSettingsSchema = ZodObject<{
  [K in keyof Partial<MailVacation>]: K extends keyof MailVacation
    ? ZodType<MailVacation[K]>
    : never
}>

const schema = z.object({
  enabled: z.boolean(),
  subject: z.string(),
  message: z.string(),
  constraints: z.object({
    startDate: z.string(),
    endDate: z.string(),
    startHour: z.string(),
    endHour: z.string(),
    enableDates: z.boolean(),
    enableHours: z.boolean(),
    enableDays: z.boolean(),
    days: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    }),
  }),
  emails: z.array(z.string()),
  response: z.object({
    interval: z.string(),
    toMaillingList: z.boolean(),
    alwaysSend: z.boolean(),
  }),
  discardMails: z.boolean(),
}) satisfies VacationMailSettingsSchema

export { schema }
