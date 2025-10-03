'use client'

import DomainConfigFormPage from '@/features/admin-panel/components/form/admin-panel-domain-config-form'
<<<<<<< HEAD
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
=======
import { useGetCustomDomainConfigQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useParams } from 'next/navigation'

export default function CustomDomainPage() {
  const { custom_domain_id } = useParams()
  const customDomainId = custom_domain_id as string
  const {
    data: customDomainConfig,
    isLoading,
    // error,
  } = useGetCustomDomainConfigQuery(customDomainId)

  // if (error) return <div>Erreur lors du chargement du domaine</div>

  const tabNames = customDomainConfig ? Object.keys(customDomainConfig) : []
  console.log('CustomDomainPage - tabNames:', tabNames)
  const tabDataByTab = customDomainConfig || {}

  function handleFormSubmit(values: Record<string, unknown>) {
    console.log('Form submitted:', values)
    // TODO: POST mutation si besoin
  }
>>>>>>> 9cf55d6 (wip admin form)

  return (
    <DomainConfigFormPage
      domainName={customDomainId}
      tabNames={tabNames}
      tabDataByTab={tabDataByTab}
<<<<<<< HEAD
      onSubmit={handleSubmit}
      isLoading={isLoading}
      isFormLoading={isFormLoading}
      description={domainDescription}
      onUpdateDescription={updateDomainDescription}
=======
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
>>>>>>> 9cf55d6 (wip admin form)
    />
  )
}
