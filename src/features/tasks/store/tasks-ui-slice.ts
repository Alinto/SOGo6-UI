import type { TaskListFilter } from '../tasks-types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface TasksUiState {
  selectedTaskKey: string | null
  selectedCalendarKey: string | null
  statusFilter: TaskListFilter
  searchQuery: string
  isFormOpen: boolean
  editingTaskKey: string | null
  selectionMode: boolean
  selectedTaskKeys: string[]
}

const initialState: TasksUiState = {
  selectedTaskKey: null,
  selectedCalendarKey: null,
  statusFilter: 'all',
  searchQuery: '',
  isFormOpen: false,
  editingTaskKey: null,
  selectionMode: false,
  selectedTaskKeys: [],
}

function clearSelectionState(state: TasksUiState) {
  state.selectionMode = false
  state.selectedTaskKeys = []
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
      clearSelectionState(state)
    },
    setStatusFilter: (state, action: PayloadAction<TaskListFilter>) => {
      state.statusFilter = action.payload
      clearSelectionState(state)
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    openCreateForm: (state) => {
      state.isFormOpen = true
      state.editingTaskKey = null
      clearSelectionState(state)
    },
    openEditForm: (state, action: PayloadAction<string>) => {
      state.isFormOpen = true
      state.editingTaskKey = action.payload
      clearSelectionState(state)
    },
    closeForm: (state) => {
      state.isFormOpen = false
      state.editingTaskKey = null
    },
    enterSelectionMode: (state) => {
      state.selectionMode = true
      state.selectedTaskKeys = []
    },
    exitSelectionMode: (state) => {
      clearSelectionState(state)
    },
    toggleTaskSelection: (state, action: PayloadAction<string>) => {
      if (!state.selectionMode) return
      const key = action.payload
      const index = state.selectedTaskKeys.indexOf(key)
      if (index === -1) {
        state.selectedTaskKeys.push(key)
      } else {
        state.selectedTaskKeys.splice(index, 1)
      }
    },
    setSelectedTaskKeys: (state, action: PayloadAction<string[]>) => {
      state.selectedTaskKeys = action.payload
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
  enterSelectionMode,
  exitSelectionMode,
  toggleTaskSelection,
  setSelectedTaskKeys,
} = tasksUiSlice.actions

export const selectTasksUi = (state: { tasksUi: TasksUiState }) =>
  state.tasksUi

export default tasksUiSlice.reducer
