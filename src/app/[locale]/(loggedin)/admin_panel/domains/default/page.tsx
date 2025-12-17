'use client'

import DomainConfigFormPage from '@/features/admin-panel/components/form/admin-panel-domain-config-form'
import { useDomainConfig } from '@/features/admin-panel/components/form/use-domain-config'

export default function DomainsPage() {
  const domainName = 'Default'
  const { tabNames, tabDataByTab, isLoading, isFormLoading, handleSubmit } =
    useDomainConfig({ customDomainId: undefined })
  return (
    <DomainConfigFormPage
      domainName={domainName}
      tabNames={tabNames}
      tabDataByTab={tabDataByTab}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      isFormLoading={isFormLoading}
    />
  )
}
