import type { ImapMessages } from '@/features/mails/mails-types'
import React, { type JSX } from 'react'

export const ActionId = {
  GO_BACK: 'go-back',
  GO_NEXT: 'go-next',
  DELETE: 'delete',
  SPAM: 'spam',
  HAM: 'ham',
  MARK_UNREAD: 'mark-unread',
  LABEL: 'label',
  IMPORTANT: 'important',
  MORE: 'more',
  ARCHIVE: 'archive',
  DOWNLOAD: 'download',
  MOVE: 'move',
  COPY: 'copy',
  PRINT: 'print',
  VIEW_SOURCE: 'view-source',
  REPLY: 'reply',
  REPLY_ALL: 'reply-all',
  FORWARD: 'forward',
  EDIT_DRAFT: 'edit-draft',
  USE_TEMPLATE: 'use-template',
} as const

export type ActionIdValue = (typeof ActionId)[keyof typeof ActionId]

export interface MailSubjectProps {
  subject: string
  labels?: React.ReactNode
}

export type Action = {
  id?: ActionIdValue | string
  icon: React.ReactNode
  title?: string
  disabled?: boolean
}

export type MailActionsBarProps = {
  actions: Action[]
  className?: string
  compact?: boolean
  onAction?: (idx: number, action: Action) => void
  children?: React.ReactNode
}

export type MailReturnButtonProps = {
  folderPath: string
  tooltip?: string
  className?: string
  onBack?: () => void
}

export type EmailContact = {
  name?: string
  email: string
}

export type MailHeaderProps = {
  from: EmailContact
  to: EmailContact[]
  cc?: EmailContact[]
  showUnsubscribeButton?: boolean
}

export type UnsubscribeDialogProps = {
  open: boolean
  onOpenChange: (_open: boolean) => void
  senderName?: string
  senderEmail?: string
}

export type RightActionsType = {
  id: string
  icon: JSX.Element
  title: string
}[]

export type MailHeaderFullProps = MailHeaderProps & {
  date: number
  mail?: ImapMessages
  mailId?: string
  folder?: string
  accountId?: string
}

export type ImapAttachmentPart = {
  partId: string
  name: string
  contentType: string
  size: number
}

export type AttachmentNameProps = {
  name: string
  maxLength?: number
  className?: string
}

export type MailAttachmentProps = {
  part: ImapAttachmentPart
  className?: string
  attachmentsUrl?: string
}

export type ImapAttachments = {
  parts?: ImapAttachmentPart[]
  zipUri?: string
  count: number
}

export type MailContentProps = {
  body: string
  attachments?: ImapAttachments
  attachmentsUrl: string
}

export type MailShowImageProps = {
  onShowImages: () => void
}
