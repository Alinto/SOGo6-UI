import type { ForwardFormValues } from '../mail-forward-types'
import { z } from 'zod'

export type { ForwardFormValues }

type ForwardTranslator = (
  key: string,
  values?: Record<string, string>
) => string

const emailSchema = z.string().email()

export const createForwardSchema = (t: ForwardTranslator) =>
  z
    .object({
      enabled: z.boolean(),
      emails: z.array(z.object({ value: z.string().email() })),
      email: z
        .string()
        .refine((value) => value === '' || emailSchema.safeParse(value).success, {
          message: t('errors.email.invalid.string'),
        }),
      alwaysSend: z.boolean(),
      keepCopy: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (values.enabled && values.emails.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('errors.validation.addresses_required.string'),
          path: ['emails'],
        })
      }
    })
