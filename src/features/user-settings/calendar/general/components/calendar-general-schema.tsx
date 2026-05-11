'use client'
import { z, ZodObject, ZodType } from 'zod'
import { CalendarGeneralSettings } from '../../../store/user-preferences-types'

type CalendarGeneralSettingsSchema = ZodObject<{
  [K in keyof Partial<CalendarGeneralSettings>]: K extends keyof CalendarGeneralSettings
    ? ZodType<CalendarGeneralSettings[K]>
    : never
}>

export const eventState = ['PUBLIC', 'CONFIDENTIAL', 'PRIVATE'] as const

const schema = z.object({
  calendarCreationNotif: z.boolean(),
  calendarViewFirstDay: z.number().min(0).max(6),
  workdayStartTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    ,
  workdayEndTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    ,
  busyOffHours: z.boolean(),
  calendarDaysShowed: z
    .number()
    .min(0)
    .max(6)
    .array()
    ,
  calendarWeekNumberFormat: z.enum(['%U', '%W', '%V']),
  calendarDefault: z.string(),
  eventDefaultClass: z.enum(eventState),
  taskDefaultClass: z.enum(['PUBLIC', 'CONFIDENTIAL', 'PRIVATE']),
  journalDefaultClass: z.enum(['PUBLIC', 'CONFIDENTIAL', 'PRIVATE']),
  eventDefaultReminder: z.string(),
  taskDefaultReminder: z.string(),
  journalDefaultReminder: z.string(),
  noInvitation: z.boolean(),
  noInvitationWhitelist: z.array(z.string()),
  doNotSendInvitFromDav: z.boolean(),
  davForceSyncFromClient: z.boolean(),
}) satisfies CalendarGeneralSettingsSchema

export { schema }
