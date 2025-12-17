'use client'

import { AdminDataTable } from '@/features/admin-panel/components/admin-data-table'
import { ruleColumns } from '@/features/admin-panel/components/rule-columns'
import AdminDataTableSkeleton from '@/features/admin-panel/components/skeletons/admin-data-table-skeleton'
import { useGetRulesQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'

export default function RulesPage() {
  const t = useTranslations('')

  const { data: rules = [], isLoading, isError } = useGetRulesQuery()

  if (isLoading) {
    return <AdminDataTableSkeleton />
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">
        {t('ADMIN_PANNEL_RULE.title.string')}
      </h2>
      <AdminDataTable
        data={rules}
        columns={ruleColumns}
        filterColumn="name"
        filterPlaceholder={t('ADMIN_PANNEL_RULE.filter_placeholder.string')}
        actionButtonLabel={t('ADMIN_PANNEL_RULE.add_new_rule.string')}
      />
    </div>
  )
}
