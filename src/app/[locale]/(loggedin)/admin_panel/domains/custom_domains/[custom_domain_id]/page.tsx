'use client'

import DomainConfigFormPage from '@/features/admin-panel/components/form/admin-panel-domain-config-form'
import { useDomainConfig } from '@/features/admin-panel/components/form/use-domain-config'
import { useParams } from 'next/navigation'

export default function CustomDomainPage() {
  const { custom_domain_id } = useParams()
  const customDomainId = custom_domain_id as string

  const {
    tabNames,
    tabDataByTab,
    isLoading,
    isFormLoading,
    handleSubmit,
    domainDescription,
    updateDomainDescription,
  } = useDomainConfig({ customDomainId })

  return (
    <DomainConfigFormPage
      domainName={customDomainId}
      tabNames={tabNames}
      tabDataByTab={tabDataByTab}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      isFormLoading={isFormLoading}
      description={domainDescription}
      onUpdateDescription={updateDomainDescription}
    />
  )
}
