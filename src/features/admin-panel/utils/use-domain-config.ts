'use client'

import {
  useGetCustomDomainConfigQuery,
  useGetDomainDefaultQuery,
  useGetDynamicFormQuery,
  usePatchDomainDefaultMutation,
  useSaveCustomDomainConfigMutation,
} from '@/features/admin-panel/store/admin-panel-api'
import { useCallback, useMemo } from 'react'

type UseDomainConfigOpts = {
  customDomainId?: string | null
}

/**
 * Hook that centralizes the common logic used by both the "default" and "custom" domain pages.
 * - fetches dynamic form metadata
 * - fetches either domain-default or custom domain settings depending on presence of customDomainId
 * - builds tabNames and tabDataByTab in the same shape used by DomainConfigFormPage
 * - exposes a submit handler that calls the appropriate mutation
 */
export function useDomainConfig({ customDomainId }: UseDomainConfigOpts) {
  const { data: adminConfig, isLoading: isFormMetaLoading } =
    useGetDynamicFormQuery()

  // fetch domain-default only when customDomainId is not provided
  const { data: domainDefaultData, isLoading: isDefaultLoading } =
    useGetDomainDefaultQuery(undefined, {
      skip: Boolean(customDomainId),
    })

  // fetch custom domain config only when customDomainId is provided
  const { data: customConfigData, isLoading: isCustomLoading } =
    useGetCustomDomainConfigQuery(customDomainId ?? '', {
      skip: !customDomainId,
    })

  const [patchDomainDefault, { isLoading: isPatching }] =
    usePatchDomainDefaultMutation()
  const [saveCustomDomainConfig, { isLoading: isSaving }] =
    useSaveCustomDomainConfigMutation()

  const isLoading = Boolean(
    isFormMetaLoading || isDefaultLoading || isCustomLoading
  )

  // Build the same tabNames and tabDataByTab shape used previously in both pages
  const { tabNames, tabDataByTab } = useMemo(() => {
    const domainArray = adminConfig?.data.domain ?? []

    const names = domainArray.map((entry: Record<string, unknown>) => {
      const sectionKey =
        Object.keys(entry).find((k) => k !== 'is_duplicable') ??
        Object.keys(entry)[0]
      return sectionKey
    })

    const tabData: Record<string, any> = {}

    // settings coming either from domainDefaultData.data or customConfigData.data.settings
    const defaultSettings = domainDefaultData?.data ?? {}
    const customSettings = customConfigData?.data?.settings ?? {}
    // pick which settings to use depending on presence of customDomainId
    const settings = customDomainId ? customSettings : defaultSettings

    domainArray.forEach((entry: Record<string, any>) => {
      const sectionKey =
        Object.keys(entry).find((k) => k !== 'is_duplicable') ??
        Object.keys(entry)[0]
      // clone options to avoid mutation
      const origOptions = (entry[sectionKey] ?? []) as any[]
      const options = origOptions.map((o) => ({ ...(o ?? {}) }))
      const is_duplicable = Boolean(entry.is_duplicable)

      const sectionSettings = settings ? settings[sectionKey] : undefined

      if (is_duplicable) {
        if (sectionSettings) {
          let initialValues: any[] = []
          if (Array.isArray(sectionSettings)) {
            initialValues = sectionSettings
          } else if (
            typeof sectionSettings === 'object' &&
            sectionSettings !== null
          ) {
            // convert keyed object (US_UID => object) to array of values
            initialValues = Object.values(sectionSettings)
          }
          tabData[sectionKey] = {
            options,
            is_duplicable,
            initial_values: JSON.parse(JSON.stringify(initialValues)),
            current_values: JSON.parse(JSON.stringify(initialValues)),
          }
        } else {
          tabData[sectionKey] = { options, is_duplicable }
        }
      } else {
        if (sectionSettings && typeof sectionSettings === 'object') {
          tabData[sectionKey] = {
            options,
            is_duplicable,
            current_values: JSON.parse(JSON.stringify(sectionSettings)),
          }
        } else {
          tabData[sectionKey] = { options, is_duplicable }
        }
      }
    })

    return { tabNames: names, tabDataByTab: tabData }
  }, [adminConfig, domainDefaultData, customConfigData, customDomainId])

  // helper used by pages to convert arrays back to maps for duplicable sections
  const buildSettingsPayload = useCallback(
    (values: Record<string, unknown>) => {
      const settings: Record<string, any> = {}

      Object.entries(values).forEach(([sectionKey, value]) => {
        const sectionMeta = (tabDataByTab as any)[sectionKey]
        const isDuplicable = sectionMeta?.is_duplicable ?? Array.isArray(value)

        if (isDuplicable && Array.isArray(value)) {
          const arr = value as any[]
          const mapped: Record<string, any> = {}
          arr.forEach((item: any, idx: number) => {
            // prefer US_UID if present, otherwise try common alternatives or fall back to index
            const possibleKey =
              (item && (item.US_UID ?? item.US_NAME ?? item.id ?? item.name)) ||
              `${idx}`
            const key = String(possibleKey)
            mapped[key] = item
          })
          settings[sectionKey] = mapped
        } else {
          settings[sectionKey] = value
        }
      })

      return settings
    },
    [tabDataByTab]
  )

  // unified submit handler: will call saveCustomDomainConfig for custom domains,
  // or patchDomainDefault for the default domain.
  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (customDomainId) {
        // for custom domains we save full object (existing flow)
        await saveCustomDomainConfig({
          customDomainId: customDomainId.toLowerCase(),
          config: values,
        }).unwrap()
      } else {
        // for default domain we patch only diffs and convert arrays to keyed objects for duplicable sections
        const settings = buildSettingsPayload(values)
        await patchDomainDefault({ config: settings }).unwrap()
      }
    },
    [
      customDomainId,
      saveCustomDomainConfig,
      patchDomainDefault,
      buildSettingsPayload,
    ]
  )

  const isFormLoading = Boolean(isPatching || isSaving)

  return {
    adminConfig,
    tabNames,
    tabDataByTab,
    isLoading,
    isFormLoading,
    handleSubmit,
  }
}
