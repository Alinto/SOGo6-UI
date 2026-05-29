export type {
  ApiTaskListResponse,
  ApiTaskResponse,
  Task,
  TaskCreateBody,
  TaskListFilter,
  TaskQueryParams,
  TaskStatus,
  TaskUpdateBody,
  TaskVisibility,
} from './tasks-types'

export {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetCalendarTasksQuery,
  useGetTaskByIdQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
  tasksApiEndpoints,
} from './store/tasks-api'

export {
  closeForm,
  openCreateForm,
  openEditForm,
  selectTasksUi,
  setCalendarFilter,
  setSearchQuery,
  setStatusFilter,
  setSelectedTask,
} from './store/tasks-ui-slice'

export { default as tasksUiReducer } from './store/tasks-ui-slice'

export { useTaskState } from './hooks/use-task-state'
export { useTasksSource } from './hooks/use-tasks-source'

export { default as TasksPage } from './components/tasks-page'
export { default as TasksSidebar } from './components/sidebar/sidebar'
