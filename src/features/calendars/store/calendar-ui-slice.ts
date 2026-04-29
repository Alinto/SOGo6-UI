import { createSlice } from '@reduxjs/toolkit'

interface CalendarUiState {
  createEventRequested: boolean
}

const initialState: CalendarUiState = {
  createEventRequested: false,
}

const calendarUiSlice = createSlice({
  name: 'calendarUi',
  initialState,
  reducers: {
    requestCreateEvent: (state) => {
      state.createEventRequested = true
    },
    clearCreateEventRequest: (state) => {
      state.createEventRequested = false
    },
  },
})

export const { requestCreateEvent, clearCreateEventRequest } =
  calendarUiSlice.actions

export default calendarUiSlice.reducer
