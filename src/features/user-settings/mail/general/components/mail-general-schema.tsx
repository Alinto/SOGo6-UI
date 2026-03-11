'use client'
import { z, ZodObject, ZodType } from 'zod'
import { MailGeneralSettings } from '../mail-general-types'

type GeneralMailSettingsSchema = ZodObject<{
  [K in keyof Partial<MailGeneralSettings>]: K extends keyof MailGeneralSettings
    ? ZodType<MailGeneralSettings[K]>
    : never
}>
const schema = z.object({
  displaySubscribeMailboxesOnly: z.boolean(),
  EAS: z.boolean(),
  countAllUnseen: z.boolean(),
  sortByThreads: z.boolean(),
  displayFullEmails: z.boolean(),
  hideInlineAttachments: z.boolean(),
  autoMarkAsRead: z.boolean(),
  autoMarkAsReadDelay: z.string(),
  forwardMessages: z.enum(['inline', 'attachment']),
  startReply: z.enum(['above', 'below']),
  placeSignature: z.enum(['above', 'below']),
  signOnNew: z.boolean(),
  signOnReply: z.boolean(),
  signOnForward: z.boolean(),
  composeIn: z.enum(['html', 'plain']),
  defaultFontSize: z.enum(['sm', 'md', 'lg']),
  displayRemoteImages: z.boolean(),
  composeOpening: z.enum(['ask', 'always', 'never']),
}) satisfies GeneralMailSettingsSchema

export { schema }
