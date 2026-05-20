// mail-compose-slice.ts
import type { Identity } from '@/features/user-profile/profile-types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const MAIL_PRIORITY_LOWEST = 'lowest'
export const MAIL_PRIORITY_LOW = 'low'
export const MAIL_PRIORITY_NORMAL = 'normal'
export const MAIL_PRIORITY_HIGH = 'high'
export const MAIL_PRIORITY_HIGHEST = 'highest'

export interface MailComposeAttachment {
  id: string
  name: string
  size: number
  type: string
  file?: File
  uploadProgress?: number
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error'
  errorMessage?: string
}

export interface MailComposeRecipient {
  name?: string
  email: string
}

export interface MailComposeDraft {
  id: string
  mailUid: string | null
  to: MailComposeRecipient[]
  cc: MailComposeRecipient[]
  bcc: MailComposeRecipient[]
  subject: string
  body: string
  attachments: MailComposeAttachment[]
  inReplyTo?: string
  forwardOf?: string
  priority:
    | typeof MAIL_PRIORITY_LOWEST
    | typeof MAIL_PRIORITY_LOW
    | typeof MAIL_PRIORITY_NORMAL
    | typeof MAIL_PRIORITY_HIGH
    | typeof MAIL_PRIORITY_HIGHEST
  requestReadReceipt?: boolean
  isDirty: boolean
  lastSaved?: number
  createdAt: number
  updatedAt: number
  selectedIdentity?: Identity
  selectedSignatureKey: string | null
}

export interface MailComposeState {
  drafts: Record<string, MailComposeDraft>
  activeDraftId: string | null
  openDraftIds: string[]
  isSending: boolean
  sendError: string | null
  pendingInsert: string | null
}

export const MAX_OPEN_DRAFTS = 3

const initialState: MailComposeState = {
  drafts: {},
  activeDraftId: null,
  openDraftIds: [],
  isSending: false,
  sendError: null,
  pendingInsert: null,
}

const mailComposeSlice = createSlice({
  name: 'mailCompose',
  initialState,
  reducers: {
    createDraft: (
      state,
      action: PayloadAction<{
        id: string
        inReplyTo?: string
        forwardOf?: string
        initialData?: Partial<
          Omit<MailComposeDraft, 'id' | 'createdAt' | 'updatedAt' | 'isDirty'>
        >
      }>
    ) => {
      if (state.openDraftIds.length >= MAX_OPEN_DRAFTS) return

      const { id, inReplyTo, forwardOf, initialData } = action.payload
      const now = Date.now()
      state.drafts[id] = {
        id,
        mailUid: null,
        to: initialData?.to ?? [],
        cc: initialData?.cc ?? [],
        bcc: initialData?.bcc ?? [],
        subject: initialData?.subject ?? '',
        body: initialData?.body ?? '',
        attachments: initialData?.attachments ?? [],
        inReplyTo,
        forwardOf,
        priority: initialData?.priority ?? MAIL_PRIORITY_NORMAL,
        requestReadReceipt: initialData?.requestReadReceipt ?? false,
        isDirty: false,
        createdAt: now,
        updatedAt: now,
        // Default to first signature key from the initial identity if provided
        selectedSignatureKey:
          Object.keys(
            (initialData?.selectedIdentity?.signatures as Record<
              string,
              string
            >) ?? {}
          )[0] ?? null,
      }
      state.openDraftIds.push(id)
      state.activeDraftId = id
    },

    setActiveDraft: (state, action: PayloadAction<string | null>) => {
      state.activeDraftId = action.payload
    },

    closeDraft: (state, action: PayloadAction<{ draftId: string }>) => {
      state.openDraftIds = state.openDraftIds.filter(
        (id) => id !== action.payload.draftId
      )
      if (state.activeDraftId === action.payload.draftId) {
        state.activeDraftId =
          state.openDraftIds[state.openDraftIds.length - 1] ?? null
      }
    },

    updateRecipients: (
      state,
      action: PayloadAction<{
        draftId: string
        field: 'to' | 'cc' | 'bcc'
        recipients: MailComposeRecipient[]
      }>
    ) => {
      const { draftId, field, recipients } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft[field] = recipients
        draft.isDirty = true
        draft.updatedAt = Date.now()
      }
    },

    updateMailUid: (
      state,
      action: PayloadAction<{ draftId: string; mailUid: string }>
    ) => {
      const { draftId, mailUid } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.mailUid = mailUid
      }
    },

    updateSubject: (
      state,
      action: PayloadAction<{ draftId: string; subject: string }>
    ) => {
      const { draftId, subject } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.subject = subject
        draft.isDirty = true
        draft.updatedAt = Date.now()
      }
    },

    updateBody: (
      state,
      action: PayloadAction<{ draftId: string; body: string }>
    ) => {
      const { draftId, body } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.body = body
        draft.isDirty = true
        draft.updatedAt = Date.now()
      }
    },

    addAttachment: (
      state,
      action: PayloadAction<{
        draftId: string
        attachment: MailComposeAttachment
      }>
    ) => {
      const { draftId, attachment } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.attachments.push(attachment)
        draft.isDirty = true
        draft.updatedAt = Date.now()
      }
    },

    updateAttachmentProgress: (
      state,
      action: PayloadAction<{
        draftId: string
        attachmentId: string
        progress: number
        status: MailComposeAttachment['uploadStatus']
      }>
    ) => {
      const { draftId, attachmentId, progress, status } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        const attachment = draft.attachments.find((a) => a.id === attachmentId)
        if (attachment) {
          attachment.uploadProgress = progress
          attachment.uploadStatus = status
        }
      }
    },

    removeAttachment: (
      state,
      action: PayloadAction<{ draftId: string; attachmentId: string }>
    ) => {
      const { draftId, attachmentId } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.attachments = draft.attachments.filter(
          (a) => a.id !== attachmentId
        )
        draft.isDirty = true
        draft.updatedAt = Date.now()
      }
    },

    updatePriority: (
      state,
      action: PayloadAction<{
        draftId: string
        priority: MailComposeDraft['priority']
      }>
    ) => {
      const { draftId, priority } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.priority = priority
        draft.isDirty = true
        draft.updatedAt = Date.now()
      }
    },

    toggleReadReceipt: (state, action: PayloadAction<{ draftId: string }>) => {
      const { draftId } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.requestReadReceipt = !draft.requestReadReceipt
        draft.isDirty = true
        draft.updatedAt = Date.now()
      }
    },

    markDraftSaved: (state, action: PayloadAction<{ draftId: string }>) => {
      const { draftId } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.isDirty = false
        draft.lastSaved = Date.now()
      }
    },

    deleteDraft: (state, action: PayloadAction<{ draftId: string }>) => {
      const { draftId } = action.payload
      delete state.drafts[draftId]
      state.openDraftIds = state.openDraftIds.filter((id) => id !== draftId)
      if (state.activeDraftId === draftId) {
        state.activeDraftId =
          state.openDraftIds[state.openDraftIds.length - 1] ?? null
      }
    },

    setSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload
      if (action.payload) state.sendError = null
    },

    setSendError: (state, action: PayloadAction<string | null>) => {
      state.sendError = action.payload
      state.isSending = false
    },

    clearAllDrafts: (state) => {
      state.drafts = {}
      state.activeDraftId = null
      state.openDraftIds = []
    },

    setPendingInsert: (state, action: PayloadAction<string | null>) => {
      state.pendingInsert = action.payload
    },

    updateIdentity: (
      state,
      action: PayloadAction<{ draftId: string; identity: Identity }>
    ) => {
      const { draftId, identity } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.selectedIdentity = identity
      }
    },

    updateSelectedSignatureKey: (
      state,
      action: PayloadAction<{ draftId: string; key: string | null }>
    ) => {
      const { draftId, key } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.selectedSignatureKey = key
      }
    },
  },
})

export const {
  createDraft,
  setActiveDraft,
  closeDraft,
  updateRecipients,
  updateSubject,
  updateBody,
  addAttachment,
  updateAttachmentProgress,
  removeAttachment,
  updatePriority,
  toggleReadReceipt,
  markDraftSaved,
  deleteDraft,
  setSending,
  setSendError,
  clearAllDrafts,
  setPendingInsert,
  updateIdentity,
  updateSelectedSignatureKey,
  updateMailUid,
} = mailComposeSlice.actions

export default mailComposeSlice.reducer
