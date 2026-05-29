import type { Task, TaskListFilter } from '../tasks-types'
import {
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming,
} from './task-due'

export function isActiveTask(task: Task): boolean {
  return task.status !== 'completed' && task.status !== 'cancelled'
}

export function taskMatchesListFilter(
  task: Task,
  filter: TaskListFilter
): boolean {
  switch (filter) {
    case 'all':
      return isActiveTask(task)
    case 'today':
      return isTaskDueToday(task)
    case 'upcoming':
      return isTaskUpcoming(task)
    case 'overdue':
      return isTaskOverdue(task)
    case 'completed':
      return task.status === 'completed'
    default:
      return true
  }
}
