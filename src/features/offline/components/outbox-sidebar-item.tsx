'use client'

import { Badge } from '@/components/ui/badge'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useRouter } from '@/lib/i18n/navigation'
import { SendHorizonal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { memo } from 'react'
import { isPwaOutboxEnabled } from '../flags'
import { useOutboxList } from '../hooks/use-outbox'

function OutboxSidebarItem() {
  const t = useTranslations('PWA')
  const { push } = useRouter()
  const { account } = useParams()
  const { pendingCount } = useOutboxList()

  if (!isPwaOutboxEnabled()) return null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        onClick={() => push(`/u/${account}/outbox`)}
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
