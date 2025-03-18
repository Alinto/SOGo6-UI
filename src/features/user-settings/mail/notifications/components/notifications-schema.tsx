'use client'
import { z, ZodObject, ZodType } from 'zod'
import { MailNotifications } from '../mail-notifications-type'

type NotificationsMailSettingsSchema = ZodObject<{
  [K in keyof Partial<MailNotifications>]: K extends keyof MailNotifications
    ? ZodType<MailNotifications[K]>
    : never
}>

const schema = z.object({
  enabled: z.boolean(),
  emails: z.array(z.object({ value: z.string().email() })),
  message: z.string().nonempty({ message: 'required.common.string' }),
  email: z
    .string()
    .min(0)
    .email({
      message: 'invalid.email.string',
    })
    .or(z.literal('')),
}) satisfies NotificationsMailSettingsSchema

export { schema }
