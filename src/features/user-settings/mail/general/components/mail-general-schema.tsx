'use client'
import { z, ZodObject, ZodType } from 'zod'
import { MailGeneralSettings } from '@/features/user-settings/store/user-preferences-types'

type GeneralMailSettingsSchema = ZodObject<{
  [K in keyof Partial<MailGeneralSettings>]: K extends keyof MailGeneralSettings
    ? ZodType<MailGeneralSettings[K]>
    : never
}>
const schema = z.object({
  // displaySubscribeMailboxesOnly: z.boolean(),
  // displayFullEmails: z.boolean(),
  // defaultFontSize: z.enum(['sm', 'md', 'lg']),
  // composeOpening: z.enum(['ask', 'always', 'never']),

  collectUnknownAddresses: z.boolean(),
  collectUnknownAddressbookName: z.string(),
  mailAllowReceipt: z.boolean(),
  mailfolderSubscribe: z.boolean(),
  autoMarkAsReadDelay: z.number().min(0),
  draftAutosave: z.number().min(0),
  composeMailWindow: z.enum(['inline', 'popup']),
  attachmentPosition: z.enum(['below', 'above']),
  countAllUnseen: z.boolean(),
  sortByThreads: z.boolean(),
  hideInlineAttachments: z.boolean(),

  forwardMessages: z.enum(['inline', 'attachment']),
  startReply: z.enum(['above', 'below']),
  placeSignature: z.enum(['above', 'below']),
  signOnNew: z.boolean(),
  signOnReply: z.boolean(),
  signOnForward: z.boolean(),
  composeIn: z.enum(['html', 'text']),
  displayRemoteImages: z.boolean(),
}) satisfies GeneralMailSettingsSchema

export { schema }
