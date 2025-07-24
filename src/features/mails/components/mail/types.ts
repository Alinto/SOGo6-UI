import React, { type JSX } from 'react'

export interface MailSubjectProps {
  subject: string
}

type Action = {
  icon: React.ReactNode
  title?: string
}

export type MailActionsBarProps = {
  actions: Action[]
  className?: string
  onAction?: (idx: number, action: Action) => void
}

export type MailReturnButtonProps = {
  folderPath: string
  tooltip?: string
  className?: string
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

export type RightActionsType = { icon: JSX.Element; title: string }[]

export type MailHeaderFullProps = MailHeaderProps & {
  date: number
}

export type ImapAttachmentPart = {
  partId: string
  name: string
  contentType: string
  size: number
  downloadUri: string
  displayUri: string
}

export type AttachmentNameProps = {
  name: string
  maxLength?: number
  className?: string
}

export type MailAttachmentProps = {
  part: ImapAttachmentPart
  className?: string
}

export type ImapAttachments = {
  parts?: ImapAttachmentPart[]
  zipUri?: string
  count: number
}
