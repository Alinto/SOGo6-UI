'use client'

import { Badge } from '@/components/ui/badge'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { SendHorizonal } from 'lucide-react'
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

  if (!isPwaOutboxEnabled()) return null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        onClick={() => openOutbox(accountId)}
        isActive={isActive}
        className="w-full"
      >
        <SendHorizonal className="size-4" aria-hidden />
        <span className="flex-1 truncate text-left">
          {t('outbox_folder.string')}
        </span>
        {pendingCount > 0 ? (
          <Badge variant="secondary" className="ml-auto">
            {pendingCount}
          </Badge>
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default memo(OutboxSidebarItem)
