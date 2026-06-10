import '@testing-library/jest-dom'

import * as Tasks from '../index'

describe('tasks feature index', () => {
  describe('re-exports', () => {
    it('does not export type names at runtime', () => {
      expect('Task' in Tasks).toBe(false)
    })
  })

  describe('API hooks', () => {
    it('exports useGetTasksQuery', () => {
      expect(typeof Tasks.useGetTasksQuery).toBe('function')
    })

    it('exports useCreateTaskMutation', () => {
      expect(typeof Tasks.useCreateTaskMutation).toBe('function')
    })
  })

  describe('UI slice', () => {
    it('exports openCreateForm action', () => {
      expect(typeof Tasks.openCreateForm).toBe('function')
    })

    it('exports tasksUiReducer', () => {
      expect(typeof Tasks.tasksUiReducer).toBe('function')
    })
  })

  describe('hooks and components', () => {
    it('exports useTaskState and useTasksSource', () => {
      expect(typeof Tasks.useTaskState).toBe('function')
      expect(typeof Tasks.useTasksSource).toBe('function')
    })

    it('exports TasksPage and TasksSidebar', () => {
      expect(Tasks.TasksPage).toBeDefined()
      expect(Tasks.TasksSidebar).toBeDefined()
    })
  })
})
