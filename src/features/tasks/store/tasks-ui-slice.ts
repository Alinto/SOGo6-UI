import type { TaskListFilter } from '../tasks-types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface TasksUiState {
  selectedTaskKey: string | null
  selectedCalendarKey: string | null
  statusFilter: TaskListFilter
  searchQuery: string
  isFormOpen: boolean
  editingTaskKey: string | null
}

const initialState: TasksUiState = {
  selectedTaskKey: null,
  selectedCalendarKey: null,
  statusFilter: 'all',
  searchQuery: '',
  isFormOpen: false,
  editingTaskKey: null,
}

const tasksUiSlice = createSlice({
  name: 'tasksUi',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<string | null>) => {
      state.selectedTaskKey = action.payload
    },
    setCalendarFilter: (state, action: PayloadAction<string | null>) => {
      state.selectedCalendarKey = action.payload
    },
    setStatusFilter: (state, action: PayloadAction<TaskListFilter>) => {
      state.statusFilter = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    openCreateForm: (state) => {
      state.isFormOpen = true
      state.editingTaskKey = null
    },
    openEditForm: (state, action: PayloadAction<string>) => {
      state.isFormOpen = true
      state.editingTaskKey = action.payload
    },
    closeForm: (state) => {
      state.isFormOpen = false
      state.editingTaskKey = null
    },
  },
})

export const {
  setSelectedTask,
  setCalendarFilter,
  setStatusFilter,
  setSearchQuery,
  openCreateForm,
  openEditForm,
  closeForm,
} = tasksUiSlice.actions

export const selectTasksUi = (state: { tasksUi: TasksUiState }) =>
  state.tasksUi

export default tasksUiSlice.reducer
