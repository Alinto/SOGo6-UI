'use client'

import { Button } from '@/components/ui/button'
import { SidebarGroupContent } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetTasksQuery } from '@/features/tasks'
import { cn } from '@/lib/utils'
import { format, isPast, parseISO } from 'date-fns'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React, { memo } from 'react'

const TasksContent: React.FC = () => {
  const t = useTranslations('TASKS')
  const { data: tasks, isLoading } = useGetTasksQuery()

  const pending = (tasks ?? []).filter(
    (task) =>
      task.status !== 'completed' && task.status !== 'cancelled'
  )

  const preview = pending.slice(0, 5)

  return (
    <SidebarGroupContent
      className="flex flex-1 flex-col gap-2 p-2"
      data-testid="tasks-panel"
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium">{t('fast_access.title.string')}</span>
        <Button variant="link" size="sm" className="h-auto p-0" asChild>
          <Link href="/tasks">{t('fast_access.view_all.string')}</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {!isLoading && preview.length === 0 && (
        <p className="text-muted-foreground px-1 text-xs">
          {t('fast_access.empty.string')}
        </p>
      )}

      {!isLoading && preview.length > 0 && (
        <ul className="space-y-1">
          {preview.map((task) => {
            const key = task.key ?? task.id ?? ''
            const overdue =
              task.due &&
              task.status !== 'completed' &&
              (() => {
                try {
                  return isPast(parseISO(task.due))
                } catch {
                  return false
                }
              })()

            return (
              <li key={key}>
                <Link
                  href="/tasks"
                  className={cn(
                    'hover:bg-accent block rounded-md px-2 py-1.5 text-sm',
                    overdue && 'text-destructive'
                  )}
                >
                  <span className="line-clamp-1">{task.title}</span>
                  {task.due && (
                    <span className="text-muted-foreground block text-xs">
                      {format(parseISO(task.due), 'PP')}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </SidebarGroupContent>
  )
}

export default memo(TasksContent)
