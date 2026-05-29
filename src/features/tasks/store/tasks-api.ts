import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  TASKS_SLICE,
} from '@/lib/redux/api/api-slice'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  ApiTaskListResponse,
  ApiTaskResponse,
  Task,
  TaskCreateBody,
  TaskQueryParams,
  TaskUpdateBody,
} from '../tasks-types'
import { normalizeTask, normalizeTasksList } from '../utils/normalize-task'

const calendarTasksUrl = (calendarKey: string) =>
  `calendars/${encodeURIComponent(calendarKey)}/tasks`

const taskUrl = (taskKey: string) => `tasks/${encodeURIComponent(taskKey)}`

const createTaskNotifyMutation =
  (options: {
    successTitle: string
    successMessage: string
    errorTitle: string
    errorMessage: string
  }) =>
  async (
    dispatch: Parameters<typeof createApiNotificationHandler>[0],
    queryFulfilled: Promise<unknown>
  ) => {
    await createApiNotificationHandler(dispatch, options)(undefined, {
      queryFulfilled,
    })
  }

const notifyCreateTask = createTaskNotifyMutation({
  successTitle: 'task_create.success.title.string',
  successMessage: 'task_create.success.message.string',
  errorTitle: 'task_create.error.title.string',
  errorMessage: 'task_create.error.message.string',
})

const notifyUpdateTask = createTaskNotifyMutation({
  successTitle: 'task_update.success.title.string',
  successMessage: 'task_update.success.message.string',
  errorTitle: 'task_update.error.title.string',
  errorMessage: 'task_update.error.message.string',
})

const notifyDeleteTask = createTaskNotifyMutation({
  successTitle: 'task_delete.success.title.string',
  successMessage: 'task_delete.success.message.string',
  errorTitle: 'task_delete.error.title.string',
  errorMessage: 'task_delete.error.message.string',
})

function unwrapTaskResponse(
  response: ApiTaskResponse | Task
): Task {
  const raw = 'data' in response ? response.data : response
  return normalizeTask(raw)
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getTasks: builder.query<Task[], TaskQueryParams | void>({
      query: (params) => ({
        url: 'tasks',
        params: params ?? {},
      }),
      transformResponse: (response: ApiTaskListResponse | Task[]) =>
        normalizeTasksList(response),
      providesTags: [TASKS_SLICE],
    }),

    getCalendarTasks: builder.query<
      Task[],
      { calendarKey: string; params?: TaskQueryParams }
    >({
      query: ({ calendarKey, params }) => ({
        url: calendarTasksUrl(calendarKey),
        params: params ?? {},
      }),
      transformResponse: (response: ApiTaskListResponse | Task[]) =>
        normalizeTasksList(response),
      providesTags: (result, error, arg) => [
        TASKS_SLICE,
        { type: TASKS_SLICE, id: arg.calendarKey },
      ],
    }),

    getTaskById: builder.query<Task, string>({
      query: (taskKey) => ({ url: taskUrl(taskKey) }),
      transformResponse: (response: ApiTaskResponse | Task) =>
        unwrapTaskResponse(response),
      providesTags: (result, error, taskKey) => [
        { type: TASKS_SLICE, id: taskKey },
      ],
    }),

    createTask: builder.mutation<
      Task,
      { calendarKey: string; body: TaskCreateBody }
    >({
      query: ({ calendarKey, body }) => ({
        url: calendarTasksUrl(calendarKey),
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiTaskResponse | Task) =>
        unwrapTaskResponse(response),
      invalidatesTags: [TASKS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyCreateTask(dispatch, queryFulfilled)
      },
    }),

    updateTask: builder.mutation<
      Task,
      { taskKey: string; body: TaskUpdateBody; silentSuccess?: boolean }
    >({
      query: ({ taskKey, body }) => ({
        url: taskUrl(taskKey),
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiTaskResponse | Task) =>
        unwrapTaskResponse(response),
      invalidatesTags: (result, error, arg) => [
        TASKS_SLICE,
        { type: TASKS_SLICE, id: arg.taskKey },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        if (arg.silentSuccess) {
          try {
            await queryFulfilled
          } catch {
            await notifyUpdateTask(dispatch, queryFulfilled)
          }
          return
        }
        await notifyUpdateTask(dispatch, queryFulfilled)
      },
    }),

    deleteTask: builder.mutation<void, string>({
      query: (taskKey) => ({
        url: taskUrl(taskKey),
        method: 'DELETE',
      }),
      transformResponse: () => undefined,
      invalidatesTags: [TASKS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyDeleteTask(dispatch, queryFulfilled)
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTasksQuery,
  useGetCalendarTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = injectedEndpoints

export const tasksApiEndpoints = injectedEndpoints
