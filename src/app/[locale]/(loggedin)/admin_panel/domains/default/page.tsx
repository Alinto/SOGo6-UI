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
  useGetDynamicFormQuery,
  useSaveCustomDomainConfigMutation,
} from '@/features/admin-panel/store/admin-panel-api'

export default function DomainsPage() {
  const { data: adminConfig, isLoading } = useGetDynamicFormQuery()
  const [saveConfig, { isLoading: isSaving }] =
    useSaveCustomDomainConfigMutation()

  const domainName = 'Default'

  // extract the domain array and build a map: sectionName => { options: ConfigOption[], is_duplicable: boolean }
  const domainArray = adminConfig?.data.domain ?? []
  const tabNames = domainArray.map((entry: Record<string, unknown>) => {
    // find section key (exclude the is_duplicable property if present)
    const sectionKey =
      Object.keys(entry).find((k) => k !== 'is_duplicable') ??
      Object.keys(entry)[0]
    return sectionKey
  })

  const tabDataByTab: Record<string, unknown> = {}
  domainArray.forEach((entry: Record<string, any>) => {
    const sectionKey =
      Object.keys(entry).find((k) => k !== 'is_duplicable') ??
      Object.keys(entry)[0]
    const options = entry[sectionKey] ?? []
    const is_duplicable = Boolean(entry.is_duplicable)
    tabDataByTab[sectionKey] = { options, is_duplicable }
  })

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
