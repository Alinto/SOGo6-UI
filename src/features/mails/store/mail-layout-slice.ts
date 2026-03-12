import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type MailLayoutMode = 'full' | 'split'

const STORAGE_KEY = 'sogo_mail_layout'

const loadInitialMode = (): MailLayoutMode => {
  if (typeof window === 'undefined') return 'full'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'split' || saved === 'full') return saved
  } catch {
    // ignore read errors
  }
  return 'full'
}

interface MailLayoutState {
  mode: MailLayoutMode
  selectedMailIds: string[]
}

const initialState: MailLayoutState = {
  mode: loadInitialMode(),
  selectedMailIds: [],
}

const mailLayoutSlice = createSlice({
  name: 'mailLayout',
  initialState,
  reducers: {
    setMailLayout(state, action: PayloadAction<MailLayoutMode>) {
      state.mode = action.payload
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, action.payload)
        } catch {
          // ignore write errors
        }
      }
    },
    setSelectedMails(state, action: PayloadAction<string[]>) {
      state.selectedMailIds = action.payload
    },
    clearSelectedMails(state) {
      state.selectedMailIds = []
    },
  },
})

export const { setMailLayout, setSelectedMails, clearSelectedMails } = mailLayoutSlice.actions
export default mailLayoutSlice.reducer
