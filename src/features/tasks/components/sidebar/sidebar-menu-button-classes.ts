import { cn } from '@/lib/utils'

/** Matches mail/calendar sidebar row height and collapsed mode. */
export const tasksSidebarMenuButtonClassName = cn(
  'h-10 align-middle',
  'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none'
)

/** Neutral sidebar icons (same tone as mail folders). */
export const tasksSidebarMenuIconClassName =
  'h-5 w-5 shrink-0 text-sidebar-foreground/85'

export const tasksSidebarMenuLabelRowClassName =
  'flex min-w-0 flex-1 items-center gap-1.5 group-data-[collapsible=icon]:hidden'

export const tasksSidebarMenuCountClassName =
  'shrink-0 text-xs font-medium leading-none tabular-nums'

/** Compact destructive count pill: circle for single digits, expands for 10+. */
export const tasksOverdueCountBadgeClassName =
  'inline-grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground'

/** Inner label: line-height reset + slight downward nudge for optical centering. */
export const tasksOverdueCountBadgeLabelClassName =
  'block leading-none tabular-nums translate-y-px'
