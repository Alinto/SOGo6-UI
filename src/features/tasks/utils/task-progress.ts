import type { Task } from '../tasks-types'

export function clampTaskProgress(value: number | null | undefined): number {
  return Math.min(100, Math.max(0, value ?? 0))
}

/** Progress to show in lists and badges; null when nothing meaningful to display. */
export function getDisplayTaskProgress(
  task: Pick<Task, 'status' | 'percent_complete'>
): number | null {
  if (task.status === 'completed' || task.status === 'cancelled') {
    return null
  }
  const pct = clampTaskProgress(task.percent_complete)
  if (task.status === 'in_process') {
    return pct
  }
  if (pct > 0 && pct < 100) {
    return pct
  }
  return null
}
