import '@testing-library/jest-dom'

import * as TasksApi from '../tasks-api'

describe('tasks-api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('injected RTK Query hooks', () => {
    it('exports task list queries', () => {
      expect(typeof TasksApi.useGetTasksQuery).toBe('function')
      expect(typeof TasksApi.useGetCalendarTasksQuery).toBe('function')
      expect(typeof TasksApi.useGetTaskByIdQuery).toBe('function')
    })

    it('exports task mutations', () => {
      expect(typeof TasksApi.useCreateTaskMutation).toBe('function')
      expect(typeof TasksApi.useUpdateTaskMutation).toBe('function')
      expect(typeof TasksApi.useDeleteTaskMutation).toBe('function')
    })

    it('exports tasksApiEndpoints', () => {
      expect(TasksApi.tasksApiEndpoints).toBeDefined()
    })
  })
})
