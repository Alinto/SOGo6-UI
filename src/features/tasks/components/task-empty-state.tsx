'use client'

import { Button } from '@/components/ui/button'
import { ClipboardList } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

type TaskEmptyStateProps = {
  onCreateClick: () => void
}

function TaskEmptyState({ onCreateClick }: TaskEmptyStateProps) {
  const t = useTranslations('TASKS')

  return (
    <div
      data-testid="tasks-empty-state"
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <ClipboardList className="text-muted-foreground h-12 w-12 opacity-40" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{t('empty_title.string')}</p>
        <p className="text-muted-foreground max-w-sm text-xs">
          {t('empty_description.string')}
        </p>
      </div>
      <Button type="button" onClick={onCreateClick}>
        {t('new_task.string')}
      </Button>
    </div>
  )
}

export default memo(TaskEmptyState)
