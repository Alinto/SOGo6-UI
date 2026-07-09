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
import { useTaskSelection } from '../hooks/use-task-selection'
import { useTaskState } from '../hooks/use-task-state'
import { useGetTaskByIdQuery } from '../store/tasks-api'
import { skipToken } from '@reduxjs/toolkit/query'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import TaskForm from './task-form'
import TaskList from './task-list'
import TaskSelectionToolbar from './task-selection-toolbar'

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

  const {
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
  } = useTaskSelection(tasks)

  const [deleteKey, setDeleteKey] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const editingKey = ui.editingTaskKey
  const { currentData: editingTask } = useGetTaskByIdQuery(
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

  useEffect(() => {
    if (!selectionMode) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleExitSelectionMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleExitSelectionMode, selectionMode])

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

  const handleConfirmBulkDelete = useCallback(async () => {
    await handleBulkDelete()
    setBulkDeleteOpen(false)
  }, [handleBulkDelete])

  return (
    <div
      className="flex h-full flex-col gap-4 p-4 md:p-6"
      data-testid="tasks-page"
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t('page_title.string')}</h1>
        <p className="text-muted-foreground text-sm">{pageSubtitle}</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <TaskSelectionToolbar
          selectionMode={selectionMode}
          selectedCount={selectedTaskKeys.length}
          allSelected={allSelected}
          someSelected={someSelected}
          bulkActionIsReopen={bulkActionIsReopen}
          canSelect={!isLoading && tasks.length > 0}
          onEnterSelectionMode={handleEnterSelectionMode}
          onExitSelectionMode={handleExitSelectionMode}
          onSelectAll={handleSelectAll}
          onBulkComplete={handleBulkComplete}
          onBulkDelete={() => setBulkDeleteOpen(true)}
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <TaskList
            tasks={tasks}
            calendars={calendars}
            isLoading={isLoading}
            onToggleComplete={handleToggleComplete}
            onEdit={openEditForm}
            onDelete={setDeleteKey}
            onCreateClick={openCreateForm}
            selectionMode={selectionMode}
            selectedTaskKeys={selectedTaskKeys}
            onToggleSelection={handleToggleTaskSelection}
          />
        </div>
      </div>

      <TaskForm
        open={ui.isFormOpen}
        calendars={writableCalendars}
        task={editingKey ? (editingTask ?? null) : null}
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('selection.delete_dialog.title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('selection.delete_dialog.description.string', {
                count: selectedTaskKeys.length,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('selection.delete_dialog.cancel.string')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBulkDelete}>
              {t('selection.delete_dialog.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default memo(TasksPage)
