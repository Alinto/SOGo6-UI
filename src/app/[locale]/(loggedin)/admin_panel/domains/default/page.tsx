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
  useGetAdminConfigQuery,
  useSaveCustomDomainConfigMutation,
} from '@/features/admin-panel/store/admin-panel-api'

export default function DomainsPage() {
  const { data: adminConfig, isLoading } = useGetAdminConfigQuery()
  const [saveConfig, { isLoading: isSaving }] =
    useSaveCustomDomainConfigMutation()
  const domainName = 'Default'

  const tabNames = adminConfig ? Object.keys(adminConfig.domain) : []
  const tabDataByTab = adminConfig ? adminConfig.domain : {}

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
