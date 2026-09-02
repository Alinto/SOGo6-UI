'use client'

import { Progress } from '@/components/ui/progress'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useGetUserMailboxQuery } from '@/features/user-settings/mail/external-accounts/store/mailboxes-api'
import { TriangleAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

const QUOTA_WARNING_THRESHOLD_PERCENT = 80

export function MailboxQuota() {
  const t = useTranslations('MAILS_COMMONS')
  const { account } = useParams()
  const accountId = String(account ?? '0')

  const { data } = useGetUserMailboxQuery({ id: accountId })
  const quota = data?.quota

  if (!quota || !quota.storage_limit) return null

  // soft_quota_value is a percentage in hundredths (10000 = 100.00%) applied
  // to storage_limit to get the actual quota max, e.g. 5005 = 50.05%.
  const quotaMax = quota.storage_limit * (quota.soft_quota_value / 10000)

  if (!quotaMax) return null

  const percentUsed = Math.min(
    100,
    Math.max(0, (quota.storage_used / quotaMax) * 100)
  )
  const totalMb = quotaMax / 1024
  const isNearLimit = percentUsed >= QUOTA_WARNING_THRESHOLD_PERCENT

  return (
    <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
      <Progress
        value={percentUsed}
        className="bg-sidebar-foreground/20 *:data-[slot=progress-indicator]:bg-sidebar-foreground h-1"
      />
      <div className="mt-1 flex items-center gap-1">
        {isNearLimit && (
          <TooltipWrapper
            content={t('account_switcher.quota.warning.string')}
            side="top"
          >
            <TriangleAlert
              aria-hidden
              className="text-warning h-3.5 w-3.5 shrink-0"
            />
          </TooltipWrapper>
        )}
        <p className="text-sidebar-foreground/70 truncate text-xs">
          {t('account_switcher.quota.string', {
            percent: percentUsed.toFixed(2),
            total: totalMb.toFixed(0),
          })}
        </p>
      </div>
    </div>
  )
}

export default MailboxQuota
