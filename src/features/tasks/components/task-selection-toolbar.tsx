'use client'

import { Button } from '@/components/ui/button'
import TaskSelectCheckbox, {
  TaskSelectCheckboxIndicator,
} from '@/features/tasks/components/task-select-checkbox'
import { cn } from '@/lib/utils'
import { Check, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

type TaskSelectionToolbarProps = {
  selectionMode: boolean
  selectedCount: number
  allSelected: boolean
  someSelected: boolean
  bulkActionIsReopen: boolean
  canSelect: boolean
  onEnterSelectionMode: () => void
  onExitSelectionMode: () => void
  onSelectAll: (checked: boolean | 'indeterminate') => void
  onBulkComplete: () => void
  onBulkDelete: () => void
}

const toolbarShellClassName =
  'flex h-16 w-full items-center gap-3 rounded-lg border p-3'

function TaskSelectionToolbar({
  selectionMode,
  selectedCount,
  allSelected,
  someSelected,
  bulkActionIsReopen,
  canSelect,
  onEnterSelectionMode,
  onExitSelectionMode,
  onSelectAll,
  onBulkComplete,
  onBulkDelete,
}: TaskSelectionToolbarProps) {
  const t = useTranslations('TASKS')

  if (!selectionMode) {
    return (
      <button
        type="button"
        disabled={!canSelect}
        onClick={onEnterSelectionMode}
        data-testid="tasks-enter-selection-mode"
        className={cn(
          toolbarShellClassName,
          'border-border hover:bg-muted/30 cursor-pointer border-dashed text-left transition-colors',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        <TaskSelectCheckboxIndicator className="mt-0" />
        <span className="min-w-0 text-sm font-medium">
          {t('selection.enter.string')}
        </span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        toolbarShellClassName,
        'border-primary/30 bg-primary/5 min-w-0 flex-nowrap'
      )}
      data-testid="tasks-selection-toolbar"
    >
      <TaskSelectCheckbox
        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
        label={t('selection.select_all.string')}
        data-testid="tasks-select-all"
        className="mt-0 shrink-0"
        onCheckedChange={onSelectAll}
      />

      <span className="shrink-0 text-sm font-medium">
        {t('selection.count.string', { count: selectedCount })}
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={selectedCount === 0}
          onClick={() => {
            void onBulkComplete()
          }}
          data-testid="tasks-bulk-complete"
        >
          <Check className="mr-1.5 h-4 w-4" aria-hidden />
          {bulkActionIsReopen
            ? t('selection.actions.reopen.string')
            : t('selection.actions.complete.string')}
        </Button>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={selectedCount === 0}
          onClick={onBulkDelete}
          data-testid="tasks-bulk-delete"
        >
          <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
          {t('selection.actions.delete.string')}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onExitSelectionMode}
          aria-label={t('selection.cancel.string')}
          data-testid="tasks-exit-selection-mode"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}

export default memo(TaskSelectionToolbar)
