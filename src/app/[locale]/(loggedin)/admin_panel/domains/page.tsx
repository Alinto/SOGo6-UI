'use client'

import { AdminDataTable } from '@/features/admin-panel/components/admin-data-table'
import { domainColumns } from '@/features/admin-panel/components/domain-columns'
import AdminDataTableSkeleton from '@/features/admin-panel/components/skeletons/admin-data-table-skeleton'
import { useGetDomainsQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'

{
  /* This is a mock data array for demonstration purposes.
const domains: string[] = [
  'example.org',
  'sogo.nu',
  'business.com',
  'example.com',
  'test.com',
  'example.net',
  'example.edu',
  'example.io',
  'example.co.uk',
  'example.info',
  'example.biz',
  'example.us',
  'example.ca',
  'example.de',
  'example.fr',
  'example.jp',
  'example.cn',
  'example.ru',
  'example.it',
  'example.es',
  'example.au',
  'example.in',
]
*/
}

export default function DomainsPage() {
  const t = useTranslations('')
  const { data: domains = [], isLoading, isError } = useGetDomainsQuery()

  if (isLoading) {
    return <AdminDataTableSkeleton />
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">
        {t('ADMIN_PANNEL_DOMAIN.title.string')}
      </h2>
      <AdminDataTable
        data={domains}
        columns={domainColumns}
        filterColumn="domain"
        filterPlaceholder={t('ADMIN_PANNEL_DOMAIN.filter_placeholder.string')}
        actionButtonLabel={t('ADMIN_PANNEL_DOMAIN.add_new_domain.string')}
      />
    </div>
  )
}
