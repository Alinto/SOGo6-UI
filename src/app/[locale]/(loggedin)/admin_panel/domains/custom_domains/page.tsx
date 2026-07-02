'use client'

import { AdminDataTable } from '@/features/admin-panel/components/admin-data-table'
import { domainColumnsFromData } from '@/features/admin-panel/components/domain-columns'
import AdminDataTableSkeleton from '@/features/admin-panel/components/skeletons/admin-data-table-skeleton'
import { useGetDomainsQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

type DomainItem = {
  name: string
  extra_infos?: Record<string, string>
}

export default function DomainsPage(): ReactNode {
  const t = useTranslations('ADMIN_PANNEL_DOMAIN')
  const { data: domains = [], isLoading } = useGetDomainsQuery() as
    | { data?: DomainItem[]; isLoading: boolean }
    | any

  if (isLoading) {
    return <AdminDataTableSkeleton />
  }

  const columns = domainColumnsFromData(domains)

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">{t('title.string')}</h2>
      <AdminDataTable
        data={domains}
        columns={columns}
        filterColumn="name"
        filterPlaceholder={t('filter_placeholder.string')}
        actionButtonLabel={t('add_new_domain.string')}
      />
    </div>
  )
}
