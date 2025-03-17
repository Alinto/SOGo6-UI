'use client'
import { z } from 'zod'

const schema = z.object({
  displaySubscribeMailboxesOnly: z.boolean(),
  EAS: z.boolean(),
  countAllUnseen: z.boolean(),
  sortByThreads: z.boolean(),
  displayFullEmails: z.boolean(),
  hideInlineAttachments: z.boolean(),
  autoMarkAsRead: z.boolean(),
  autoMarkAsReadDelay: z.string(),
  forwardMessages: z.string(),
  startReply: z.string(),
  placeSignature: z.string(),
  signOnNew: z.boolean(),
  signOnReply: z.boolean(),
  signOnForward: z.boolean(),
  composeIn: z.string(),
  defaultFontSize: z.string(),
  displayRemoteImages: z.boolean(),
  composeOpening: z.string(),
})

const defaultValues = {
  displaySubscribeMailboxesOnly: false,
  EAS: false,
  countAllUnseen: false,
  sortByThreads: false,
  displayFullEmails: false,
  hideInlineAttachments: false,
  autoMarkAsRead: false,
  autoMarkAsReadDelay: '0',
  forwardMessages: 'inline',
  startReply: 'below',
  placeSignature: 'below',
  signOnNew: false,
  signOnReply: false,
  signOnForward: false,
  composeIn: 'html',
  defaultFontSize: 'md',
  displayRemoteImages: false,
  composeOpening: 'ask',
}

export { defaultValues, schema }
