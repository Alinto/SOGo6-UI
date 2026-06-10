'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTaskState } from '../hooks/use-task-state'
import { useGetTaskByIdQuery } from '../store/tasks-api'
import { skipToken } from '@reduxjs/toolkit/query'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useMemo, useState } from 'react'
import TaskForm from './task-form'
import TaskList from './task-list'

function TasksPage() {
  const t = useTranslations('TASKS')
  const {
    tasks,
    isLoading,
    calendars,
    writableCalendars,
    ui,
    handleToggleComplete,
    createTask,
    updateTask,
    deleteTask,
    openCreateForm,
    openEditForm,
    closeForm,
  } = useTaskState()

  const [deleteKey, setDeleteKey] = useState<string | null>(null)

  const editingKey = ui.editingTaskKey
  const { data: editingTask } = useGetTaskByIdQuery(
    editingKey ?? skipToken
  )

  const pageSubtitle = useMemo(() => {
    const labels: Record<typeof ui.statusFilter, string> = {
      all: t('sidebar.smart_views.all.string'),
      today: t('sidebar.smart_views.today.string'),
      upcoming: t('sidebar.smart_views.upcoming.string'),
      overdue: t('sidebar.smart_views.overdue.string'),
      completed: t('sidebar.smart_views.completed.string'),
    }
    return labels[ui.statusFilter]
  }, [t, ui.statusFilter])

  const handleFormSubmit = useCallback(
    async ({
      calendarKey,
      body,
      taskKey,
    }: {
      calendarKey: string
      body: Parameters<typeof createTask>[0]['body']
      taskKey?: string
    }) => {
      if (taskKey) {
        await updateTask({ taskKey, body }).unwrap()
      } else {
        await createTask({ calendarKey, body }).unwrap()
      }
    },
    [createTask, updateTask]
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteKey) return
    await deleteTask(deleteKey).unwrap()
    setDeleteKey(null)
  }, [deleteKey, deleteTask])

  return (
    <div
      className="flex h-full flex-col gap-4 p-4 md:p-6"
      data-testid="tasks-page"
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t('page_title.string')}</h1>
        <p className="text-muted-foreground text-sm">{pageSubtitle}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <TaskList
          tasks={tasks}
          calendars={calendars}
          isLoading={isLoading}
          onToggleComplete={handleToggleComplete}
          onEdit={openEditForm}
          onDelete={setDeleteKey}
          onCreateClick={openCreateForm}
        />
      </div>

      <TaskForm
        open={ui.isFormOpen}
        calendars={writableCalendars}
        task={editingTask ?? null}
        defaultCalendarKey={ui.selectedCalendarKey}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={deleteKey !== null}
        onOpenChange={(open) => !open && setDeleteKey(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_dialog.title.string')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_dialog.description.string')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete_dialog.cancel.string')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t('delete_dialog.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default memo(TasksPage)
