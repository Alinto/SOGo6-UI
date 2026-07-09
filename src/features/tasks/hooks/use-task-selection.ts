'use client'

import type { Task } from '../tasks-types'
import { useUpdateTaskMutation, useDeleteTaskMutation } from '../store/tasks-api'
import {
  enterSelectionMode,
  exitSelectionMode,
  selectTasksUi,
  setSelectedTaskKeys,
  toggleTaskSelection,
} from '../store/tasks-ui-slice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useCallback, useMemo } from 'react'

function getTaskKey(task: Task): string {
  return task.key ?? task.id ?? ''
}

export function useTaskSelection(tasks: Task[]) {
  const dispatch = useAppDispatch()
  const { selectionMode, selectedTaskKeys } = useAppSelector(selectTasksUi)

  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()

  const visibleTaskKeys = useMemo(
    () => tasks.map(getTaskKey).filter(Boolean),
    [tasks]
  )

  const selectedTasks = useMemo(
    () =>
      tasks.filter((task) => selectedTaskKeys.includes(getTaskKey(task))),
    [tasks, selectedTaskKeys]
  )

  const allSelected =
    visibleTaskKeys.length > 0 &&
    visibleTaskKeys.every((key) => selectedTaskKeys.includes(key))

  const someSelected =
    selectedTaskKeys.length > 0 &&
    visibleTaskKeys.some((key) => selectedTaskKeys.includes(key)) &&
    !allSelected

  const bulkActionIsReopen = useMemo(() => {
    return (
      selectedTasks.length > 0 &&
      selectedTasks.every((task) => task.status === 'completed')
    )
  }, [selectedTasks])

  const handleEnterSelectionMode = useCallback(() => {
    dispatch(enterSelectionMode())
  }, [dispatch])

  const handleExitSelectionMode = useCallback(() => {
    dispatch(exitSelectionMode())
  }, [dispatch])

  const handleToggleTaskSelection = useCallback(
    (taskKey: string) => {
      dispatch(toggleTaskSelection(taskKey))
    },
    [dispatch]
  )

  const handleSelectAll = useCallback(
    (checked: boolean | 'indeterminate') => {
      if (checked === true) {
        dispatch(setSelectedTaskKeys(visibleTaskKeys))
        return
      }
      dispatch(setSelectedTaskKeys([]))
    },
    [dispatch, visibleTaskKeys]
  )

  const handleBulkComplete = useCallback(async () => {
    if (selectedTasks.length === 0) return

    const allCompleted = selectedTasks.every(
      (task) => task.status === 'completed'
    )

    await Promise.all(
      selectedTasks.map((task) => {
        const taskKey = getTaskKey(task)
        if (!taskKey) return Promise.resolve()

        if (allCompleted) {
          return updateTask({
            taskKey,
            body: {
              status: 'needs_action',
              percent_complete: 0,
              completed_at: null,
            },
            silentSuccess: true,
          }).unwrap()
        }

        if (task.status === 'completed') {
          return Promise.resolve()
        }

        return updateTask({
          taskKey,
          body: {
            status: 'completed',
            percent_complete: 100,
            completed_at: new Date().toISOString(),
          },
          silentSuccess: true,
        }).unwrap()
      })
    )

    dispatch(exitSelectionMode())
  }, [dispatch, selectedTasks, updateTask])

  const handleBulkDelete = useCallback(async () => {
    if (selectedTaskKeys.length === 0) return

    await Promise.all(
      selectedTaskKeys.map((taskKey) => deleteTask(taskKey).unwrap())
    )

    dispatch(exitSelectionMode())
  }, [deleteTask, dispatch, selectedTaskKeys])

  return {
    selectionMode,
    selectedTaskKeys,
    allSelected,
    someSelected,
    bulkActionIsReopen,
    handleEnterSelectionMode,
    handleExitSelectionMode,
    handleToggleTaskSelection,
    handleSelectAll,
    handleBulkComplete,
    handleBulkDelete,
  }
}
