import type { NotificationFormValues } from '../mail-notifications-type'
import { z } from 'zod'

export type { NotificationFormValues }

type NotificationTranslator = (
  key: string,
  values?: Record<string, string>
) => string

const emailSchema = z.string().email()

export const createNotificationSchema = (t: NotificationTranslator) =>
  z
    .object({
      enabled: z.boolean(),
      emails: z.array(z.object({ value: z.string().email() })),
      email: z
        .string()
        .refine((value) => value === '' || emailSchema.safeParse(value).success, {
          message: t('errors.email.invalid.string'),
        }),
      message: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.enabled && values.emails.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('errors.validation.addresses_required.string'),
          path: ['emails'],
        })
      }
      if (values.enabled && !values.message.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('errors.validation.message_required.string'),
          path: ['message'],
        })
      }
    })
