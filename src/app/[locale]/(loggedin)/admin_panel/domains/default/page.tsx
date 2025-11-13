'use client'

import DomainConfigFormPage from '@/features/admin-panel/components/form/admin-panel-domain-config-form'
<<<<<<< HEAD
import { useDomainConfig } from '@/features/admin-panel/components/form/use-domain-config'

export default function DomainsPage() {
  const domainName = 'Default'
  const { tabNames, tabDataByTab, isLoading, isFormLoading, handleSubmit } =
    useDomainConfig({ customDomainId: undefined })
=======
import {
  useGetDomainQuery,
  useSaveCustomDomainConfigMutation,
} from '@/features/admin-panel/store/admin-panel-api'

export default function DomainsPage() {
  const { data: adminConfig, isLoading } = useGetDomainQuery()
  const [saveConfig, { isLoading: isSaving }] =
    useSaveCustomDomainConfigMutation()

  const domainName = 'Default'

  // Extract tab names from the config object keys
  const tabNames = adminConfig ? Object.keys(adminConfig) : []

  // Transform the config data structure for each tab
  // Each tab now contains the raw object/array data instead of ConfigOption[]
  const tabDataByTab = adminConfig || {}

  // TODO: à revoir plus tard, et surtout gérer les erreurs
  async function handleFormSubmit(values: Record<string, unknown>) {
    try {
      await saveConfig({
        customDomainId: domainName.toLowerCase(),
        config: values,
      }).unwrap()
      alert('New parameters saved')
    } catch (e) {
      alert('Error saving parameters')
    }
  }

>>>>>>> 9cf55d6 (wip admin form)
  return (
    <DomainConfigFormPage
      domainName={domainName}
      tabNames={tabNames}
      tabDataByTab={tabDataByTab}
<<<<<<< HEAD
      onSubmit={handleSubmit}
      isLoading={isLoading}
      isFormLoading={isFormLoading}
=======
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      isFormLoading={isSaving}
>>>>>>> 9cf55d6 (wip admin form)
    />
  )
}
