'use client'

import { Badge } from '@/components/ui/badge'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { DEFAULT_CALENDAR_COLOR } from '@/features/calendars/calendars-types'
import { useGetCalendarsQuery } from '@/features/calendars'
import { useTasksSource } from '../../hooks/use-tasks-source'
import {
  selectTasksUi,
  setCalendarFilter,
  setStatusFilter,
} from '../../store/tasks-ui-slice'
import type { TaskListFilter } from '../../tasks-types'
import { taskMatchesListFilter } from '../../utils/task-list-filter'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ListTodo,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'
import CreateTaskOpener from './create-task-opener'
import {
  tasksSidebarMenuButtonClassName,
  tasksSidebarMenuCountClassName,
  tasksSidebarMenuLabelRowClassName,
} from './sidebar-menu-button-classes'
import TasksSidebarSkeleton from './skeleton'

type SmartView = {
  id: TaskListFilter
  label: string
  icon: LucideIcon
  iconClassName?: string
  showCount: boolean
  destructiveBadge?: boolean
}

function ViewCount({
  count,
  destructive,
}: {
  count: number
  destructive?: boolean
}) {
  if (count <= 0) return null

  if (destructive) {
    return (
      <Badge
        variant="destructive"
        className="h-5 min-w-5 shrink-0 justify-center px-1.5 text-[10px] tabular-nums"
      >
        {count}
      </Badge>
    )
  }

  return <span className={tasksSidebarMenuCountClassName}>{count}</span>
}

function TasksSidebar() {
  const t = useTranslations('TASKS')
  const dispatch = useAppDispatch()
  const { statusFilter, selectedCalendarKey } = useAppSelector(selectTasksUi)
  const { tasks, isLoading: tasksLoading } = useTasksSource()
  const { data: calendars = [], isLoading: calendarsLoading } =
    useGetCalendarsQuery()

  const counts = useMemo(() => {
    const all = tasks ?? []
    const countFor = (filter: TaskListFilter) =>
      all.filter((task) => taskMatchesListFilter(task, filter)).length

    return {
      all: countFor('all'),
      today: countFor('today'),
      upcoming: countFor('upcoming'),
      overdue: countFor('overdue'),
    }
  }, [tasks])

  const smartViews: SmartView[] = useMemo(
    () => [
      {
        id: 'all',
        label: t('sidebar.smart_views.all.string'),
        icon: ListTodo,
        showCount: true,
      },
      {
        id: 'today',
        label: t('sidebar.smart_views.today.string'),
        icon: Sun,
        iconClassName: 'text-amber-500',
        showCount: true,
      },
      {
        id: 'upcoming',
        label: t('sidebar.smart_views.upcoming.string'),
        icon: CalendarDays,
        showCount: true,
      },
      {
        id: 'overdue',
        label: t('sidebar.smart_views.overdue.string'),
        icon: AlertCircle,
        iconClassName: cn(counts.overdue > 0 && 'text-destructive'),
        showCount: true,
        destructiveBadge: true,
      },
      {
        id: 'completed',
        label: t('sidebar.smart_views.completed.string'),
        icon: CheckCircle2,
        iconClassName: 'text-green-600',
        showCount: false,
      },
    ],
    [t, counts.overdue]
  )

  if (tasksLoading || calendarsLoading) {
    return <TasksSidebarSkeleton />
  }

  return (
    <>
      <SidebarGroup className="sticky top-0 z-10 ml-0 px-2 pt-2 pb-1 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <CreateTaskOpener />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="scrollbar-thin-gray min-h-0 flex-1 overflow-y-auto px-0 pb-4 group-data-[collapsible=icon]:p-0">
        <SidebarGroupLabel className="px-4">
          {t('sidebar.smart_views.title.string')}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {smartViews.map((view) => {
              const Icon = view.icon
              const count =
                view.id === 'completed'
                  ? 0
                  : counts[view.id as 'all' | 'today' | 'upcoming' | 'overdue']
              return (
                <SidebarMenuItem key={view.id}>
                  <SidebarMenuButton
                    className={tasksSidebarMenuButtonClassName}
                    isActive={statusFilter === view.id}
                    onClick={() => dispatch(setStatusFilter(view.id))}
                    tooltip={view.label}
                    title={view.label}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        view.iconClassName
                      )}
                    />
                    <div className={tasksSidebarMenuLabelRowClassName}>
                      <span className="min-w-0 shrink truncate leading-none">
                        {view.label}
                      </span>
                      {view.showCount && (
                        <ViewCount
                          count={count}
                          destructive={view.destructiveBadge}
                        />
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>

        {calendars.length > 0 && (
          <>
            <SidebarGroupLabel className="mt-2 px-4">
              {t('sidebar.calendars.title.string')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {calendars.map((calendar) => {
                  const key = calendar.key ?? calendar.id ?? ''
                  const isSelected = selectedCalendarKey === key
                  return (
                    <SidebarMenuItem key={key}>
                      <SidebarMenuButton
                        className={tasksSidebarMenuButtonClassName}
                        isActive={isSelected}
                        onClick={() =>
                          dispatch(
                            setCalendarFilter(isSelected ? null : key)
                          )
                        }
                        tooltip={calendar.name}
                        title={calendar.name}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              calendar.color ?? DEFAULT_CALENDAR_COLOR,
                          }}
                          aria-hidden
                        />
                        <div className={tasksSidebarMenuLabelRowClassName}>
                          <span className="min-w-0 shrink truncate leading-none text-sm">
                            {calendar.name}
                          </span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </>
        )}
      </SidebarGroup>
    </>
  )
}

export default memo(TasksSidebar)
