import { RootState } from '@/lib/redux/store'
import {
  MAIL_PRIORITY_NORMAL,
  MAX_OPEN_DRAFTS,
  type MailComposeState,
} from './mail-compose-slice'

export const selectMailComposeState = (state: {
  mailCompose: MailComposeState
}) => state.mailCompose

export const selectAllDrafts = (state: { mailCompose: MailComposeState }) =>
  state.mailCompose.drafts

export const selectActiveDraftId = (state: { mailCompose: MailComposeState }) =>
  state.mailCompose.activeDraftId

export const selectActiveDraft = (state: { mailCompose: MailComposeState }) => {
  const { drafts, activeDraftId } = state.mailCompose
  return activeDraftId ? drafts[activeDraftId] : null
}

export const selectDraftById =
  (draftId: string) => (state: { mailCompose: MailComposeState }) =>
    state.mailCompose.drafts[draftId]

export const selectOpenDraftIds = (state: { mailCompose: MailComposeState }) =>
  state.mailCompose.openDraftIds

export const selectCanOpenNewDraft = (state: {
  mailCompose: MailComposeState
}) => state.mailCompose.openDraftIds.length < MAX_OPEN_DRAFTS

export const selectIsSending = (state: { mailCompose: MailComposeState }) =>
  state.mailCompose.isSending

export const selectSendError = (state: { mailCompose: MailComposeState }) =>
  state.mailCompose.sendError

export const selectDraftCount = (state: { mailCompose: MailComposeState }) =>
  Object.keys(state.mailCompose.drafts).length

export const selectDraftData = (draftId: string) => (state: RootState) => {
  const draft = state.mailCompose.drafts[draftId]
  return {
    draft,
    mailKey: draft?.mailKey,
    subject: draft?.subject ?? '',
    selectedPriority: draft?.priority ?? MAIL_PRIORITY_NORMAL,
    requestReadReceipt: draft?.requestReadReceipt ?? false,
    isPlainText: draft?.isPlainText ?? false,
    selectedIdentity: draft?.selectedIdentity ?? null,
    toRecipients: draft?.to ?? [],
    ccRecipients: draft?.cc ?? [],
    bccRecipients: draft?.bcc ?? [],
    body: draft?.body ?? '',
    isDirty: draft?.isDirty ?? false,
    attachments: draft?.attachments ?? [],
  }
}
