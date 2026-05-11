import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type MailLayoutMode = 'full' | 'split'

const STORAGE_KEY = 'sogo_mail_layout'

interface MailLayoutState {
  mode: MailLayoutMode
  selectedMailIds: string[]
}

const initialState: MailLayoutState = {
  mode: 'full',
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
