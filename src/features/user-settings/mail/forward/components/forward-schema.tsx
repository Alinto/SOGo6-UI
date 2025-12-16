'use client'
import { z, ZodObject, ZodType } from 'zod'
import { MailForward } from '../mail-forward-types'

type MailForwardSettingsSchema = ZodObject<{
  [K in keyof Partial<MailForward>]: K extends keyof MailForward
    ? ZodType<MailForward[K]>
    : never
}>

const schema = z.object({
  enabled: z.boolean(),
  emails: z.array(z.object({ value: z.string().email() })),
  email: z
    .string()
    .min(0)
    .email({
      message: 'FORM_ERRORS.invalid.email.string',
    })
    .or(z.literal('')),
  alwaysForward: z.boolean(),
  keepCopy: z.boolean(),
}) satisfies MailForwardSettingsSchema

export { schema }
