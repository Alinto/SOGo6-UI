import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
  to: MailComposeRecipient[]
  cc: MailComposeRecipient[]
  bcc: MailComposeRecipient[]
  subject: string
  body: string
  attachments: MailComposeAttachment[]
  inReplyTo?: string
  forwardOf?: string
  priority?: 'low' | 'normal' | 'high'
  requestReadReceipt?: boolean
  isDirty: boolean
  lastSaved?: number
  createdAt: number
  updatedAt: number
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
    // Create a new draft
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
      if (state.openDraftIds.length >= MAX_OPEN_DRAFTS) {
        return
      }

      const { id, inReplyTo, forwardOf, initialData } = action.payload
      const now = Date.now()
      state.drafts[id] = {
        id,
        to: initialData?.to ?? [],
        cc: initialData?.cc ?? [],
        bcc: initialData?.bcc ?? [],
        subject: initialData?.subject ?? '',
        body: initialData?.body ?? '',
        attachments: initialData?.attachments ?? [],
        inReplyTo,
        forwardOf,
        priority: initialData?.priority ?? 'normal',
        requestReadReceipt: initialData?.requestReadReceipt ?? false,
        isDirty: false,
        createdAt: now,
        updatedAt: now,
      }
      state.openDraftIds.push(id)
      state.activeDraftId = id
    },

    // Set active draft
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

    // Update draft recipients
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

    // Update draft subject
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

    // Update draft body
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

    // Add attachment
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

    // Update attachment progress
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

    // Remove attachment
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

    // Update priority
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

    // Toggle read receipt
    toggleReadReceipt: (state, action: PayloadAction<{ draftId: string }>) => {
      const { draftId } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.requestReadReceipt = !draft.requestReadReceipt
        draft.isDirty = true
        draft.updatedAt = Date.now()
      }
    },

    // Mark draft as saved
    markDraftSaved: (state, action: PayloadAction<{ draftId: string }>) => {
      const { draftId } = action.payload
      const draft = state.drafts[draftId]
      if (draft) {
        draft.isDirty = false
        draft.lastSaved = Date.now()
      }
    },

    // Delete draft
    deleteDraft: (state, action: PayloadAction<{ draftId: string }>) => {
      const { draftId } = action.payload
      delete state.drafts[draftId]
      state.openDraftIds = state.openDraftIds.filter((id) => id !== draftId)
      if (state.activeDraftId === draftId) {
        state.activeDraftId =
          state.openDraftIds[state.openDraftIds.length - 1] ?? null
      }
    },

    // Set sending state
    setSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload
      if (action.payload) {
        state.sendError = null
      }
    },

    // Set send error
    setSendError: (state, action: PayloadAction<string | null>) => {
      state.sendError = action.payload
      state.isSending = false
    },

    // Clear all drafts
    clearAllDrafts: (state) => {
      state.drafts = {}
      state.activeDraftId = null
      state.openDraftIds = []
    },

    // Set pending insert (transient signal for editor content insertion)
    setPendingInsert: (state, action: PayloadAction<string | null>) => {
      state.pendingInsert = action.payload
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
} = mailComposeSlice.actions

export default mailComposeSlice.reducer
