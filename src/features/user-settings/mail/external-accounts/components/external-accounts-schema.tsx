'use client'
import {
  AUTHMECH_LOGIN,
  AUTHMECH_PLAIN,
  RECEIPT_POLICY_ALWAYS,
  RECEIPT_POLICY_ASK,
  RECEIPT_POLICY_NEVER,
  SOCKET_ENC_EXPLICIT_TLS,
  SOCKET_ENC_IMPLICIT_TLS,
  SOCKET_ENC_PLAIN,
} from '@/features/user-settings/mail/external-accounts/store/mailboxes-api-types'
import { MailboxPOSTSettings } from '@/features/user-settings/mail/external-accounts/store/mailboxes-form-types'
import { serverAddress } from '@/lib/validations/zod-utils'
import { useTranslations } from 'next-intl'
import { z, ZodObject, ZodType } from 'zod'

const schema = (
  t: ReturnType<typeof useTranslations>,
  t_commons: ReturnType<typeof useTranslations>
) => {
  const receiptPolicyEnum = z.enum([
    RECEIPT_POLICY_NEVER,
    RECEIPT_POLICY_ALWAYS,
    RECEIPT_POLICY_ASK,
  ] as const)
  type MailboxSettingsSchema = ZodObject<{
    [K in keyof Partial<MailboxPOSTSettings>]: K extends keyof MailboxPOSTSettings
      ? ZodType<MailboxPOSTSettings[K]>
      : never
  }>

  const serverSettingsSchema = z.object({
    server: serverAddress(t, t_commons),
    port: z
      .number({ message: t_commons('validation.required') })
      .int()
      .min(1)
      .max(65535),
    encryption: z.enum([
      SOCKET_ENC_PLAIN,
      SOCKET_ENC_IMPLICIT_TLS,
      SOCKET_ENC_EXPLICIT_TLS,
    ]),
    password: z.string().min(8),
    username: z.string().min(1, { message: t_commons('validation.required') }),
    auth_mech: z.enum([AUTHMECH_PLAIN, AUTHMECH_LOGIN]),
  })

  return z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: t_commons('validation.required') }),
    mail_server: serverSettingsSchema,
    mail_outgoing: serverSettingsSchema,
    // certificates: z.object,
    identities: z.array(
      z.object({
        mail: z.email(),
        name: z.string().min(1, { message: t_commons('validation.required') }),
        replyTo: z.email(),
        isDefault: z.boolean(),
        signatures: z.record(z.string(), z.string()),
      })
    ),
    receipts: z.object({
      enabled: z.boolean().default(false),
      not_to_cc: receiptPolicyEnum.default('never'),
      outside_domain: receiptPolicyEnum.default('never'),
      other: receiptPolicyEnum.default('never'),
    }),
  }) satisfies MailboxSettingsSchema
}

export { schema }
export type schemaType = z.infer<ReturnType<typeof schema>>
