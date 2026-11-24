'use client'

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useTranslations } from 'next-intl'
import { memo, type MouseEvent } from 'react'

interface RailMoreButtonProps {
  /** Full label (tooltip and accessible name), e.g. "3 more calendars". */
  label: string
  /** Number of entries it stands for, shown as "+N". */
  count: number
}

/** Icon-rail entry standing for what does not fit: expands the sidebar. */
function RailMoreButton({ label, count }: RailMoreButtonProps) {
  const t = useTranslations('COMMONS')
  const { setOpen } = useSidebar()

  const expand = (event: MouseEvent<HTMLButtonElement>) => {
    // The expanded sidebar replaces this entry: move the focus to the
    // enclosing navigation first, so it is not lost to the page.
    event.currentTarget.closest<HTMLElement>('nav')?.focus()
    setOpen(true)
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="h-10 justify-center rounded-none text-xs font-medium tabular-nums"
        tooltip={label}
        aria-label={label}
        onClick={expand}
      >
        <span>{t('sidebar.rail_more_badge.string', { count })}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default memo(RailMoreButton)
