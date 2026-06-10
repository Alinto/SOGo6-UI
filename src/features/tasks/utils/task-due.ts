import type { Task } from '../tasks-types'
import {
  addDays,
  endOfDay,
  isAfter,
  isBefore,
  isToday,
  parseISO,
  startOfDay,
} from 'date-fns'

type TaskDueFields = Pick<Task, 'due' | 'status'>

function isOpenTask(task: TaskDueFields): boolean {
  return task.status !== 'completed' && task.status !== 'cancelled'
}

export function isTaskOverdue(task: TaskDueFields): boolean {
  if (!task.due || !isOpenTask(task)) {
    return false
  }
  try {
    return isBefore(parseISO(task.due), startOfDay(new Date()))
  } catch {
    return false
  }
}

/** Due within the next 7 days, excluding overdue dates. */
export function isTaskDueSoon(
  task: TaskDueFields,
  withinDays = 7
): boolean {
  if (!task.due || !isOpenTask(task) || isTaskOverdue(task)) {
    return false
  }
  try {
    const due = parseISO(task.due)
    const limit = addDays(startOfDay(new Date()), withinDays + 1)
    return !isBefore(due, startOfDay(new Date())) && isBefore(due, limit)
  } catch {
    return false
  }
}

export function isTaskDueToday(task: TaskDueFields): boolean {
  if (!task.due || !isOpenTask(task)) {
    return false
  }
  try {
    return isToday(parseISO(task.due))
  } catch {
    return false
  }
}

/** Due after today through the next 7 days (not overdue, not today). */
export function isTaskUpcoming(task: TaskDueFields): boolean {
  if (!task.due || !isOpenTask(task) || isTaskOverdue(task)) {
    return false
  }
  try {
    const due = parseISO(task.due)
    const afterToday = endOfDay(new Date())
    const windowEnd = addDays(startOfDay(new Date()), 8)
    return isAfter(due, afterToday) && isBefore(due, windowEnd)
  } catch {
    return false
  }
}
