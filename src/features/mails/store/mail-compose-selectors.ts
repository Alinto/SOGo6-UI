import type { MailComposeDraft } from './mail-compose-slice'

interface MailComposeState {
  drafts: Record<string, MailComposeDraft>
  activeDraftId: string | null
  isComposeOpen: boolean
  isSending: boolean
  sendError: string | null
}

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

export const selectIsComposeOpen = (state: { mailCompose: MailComposeState }) =>
  state.mailCompose.isComposeOpen

export const selectIsSending = (state: { mailCompose: MailComposeState }) =>
  state.mailCompose.isSending

export const selectSendError = (state: { mailCompose: MailComposeState }) =>
  state.mailCompose.sendError

export const selectDraftCount = (state: { mailCompose: MailComposeState }) =>
  Object.keys(state.mailCompose.drafts).length
