import { 
  MAX_OPEN_DRAFTS, 
  type MailComposeDraft, 
  type MailComposeState
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