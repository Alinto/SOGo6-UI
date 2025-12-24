'use client'
import { z } from 'zod'

// Edit schema
export const imapAccountEditSchema = z.object({
  readReceipts: z.enum(['never', 'selective']),
})

// Create schema
export const imapAccountCreateSchema = z.object({
  imapServer: z.string().min(1, {
    message: 'FORM_ERRORS.required.string',
  }),
  imapPort: z
    .number()
    .int()
    .min(1, {
      message: 'FORM_ERRORS.invalid.port.min',
    })
    .max(65535, {
      message: 'FORM_ERRORS.invalid.port.max',
    }),
  imapEncryption: z.enum(['none', 'ssl', 'tls']),
  smtpServer: z.string().min(1, {
    message: 'FORM_ERRORS.required.string',
  }),
  smtpPort: z
    .number()
    .int()
    .min(1, {
      message: 'FORM_ERRORS.invalid.port.min',
    })
    .max(65535, {
      message: 'FORM_ERRORS.invalid.port.max',
    }),
  smtpAuth: z.boolean(),
  smtpEncryption: z.enum(['none', 'ssl', 'tls']),
  username: z.string().email({
    message: 'FORM_ERRORS.invalid.email.string',
  }),
  password: z.string().min(1, {
    message: 'FORM_ERRORS.required.string',
  }),
  useDefaultIdentity: z.boolean(),
  readReceipts: z.enum(['never', 'selective']),
  certificateName: z.string().optional(),
  certificateFingerprint: z.string().optional(),
})
