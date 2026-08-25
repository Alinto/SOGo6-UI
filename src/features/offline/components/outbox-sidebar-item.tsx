'use client'

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { DynamicIcon } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import { useParams, usePathname } from 'next/navigation'
import { memo } from 'react'
import { isPwaOutboxEnabled } from '../flags'
import { useOutboxList } from '../hooks/use-outbox'
import { useOfflineNav } from '../offline-nav-context'

function OutboxSidebarItem() {
  const t = useTranslations('PWA')
  const { account } = useParams()
  const pathname = usePathname()
  const { pendingCount } = useOutboxList()
  const { openOutbox, view } = useOfflineNav()
  const accountId = String(account ?? '0')
  const isActive = view.kind === 'outbox' || pathname.includes('/outbox')
  const name = t('outbox_folder.string')

  if (!isPwaOutboxEnabled()) return null
  if (pendingCount === 0 && !isActive) return null

  return (
    <SidebarMenuItem data-testid="outbox-sidebar-item">
      <SidebarMenuButton
        type="button"
        onClick={() => openOutbox(accountId)}
        isActive={isActive}
        tooltip={name}
        title={name}
        className={cn(
          'h-10 align-middle group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none'
        )}
      >
        <div className="z-50 mr-2 h-5 w-5 shrink-0 p-0 group-data-[collapsible=icon]:visible group-data-[collapsible=icon]:pl-1">
          <DynamicIcon className="h-5 w-5" name="clock" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 group-data-[collapsible=icon]:hidden">
          <span className="min-w-0 shrink truncate leading-none">{name}</span>
          {pendingCount > 0 ? (
            <span className="shrink-0 text-xs leading-none font-medium text-inherit tabular-nums">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          ) : null}
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default memo(OutboxSidebarItem)
