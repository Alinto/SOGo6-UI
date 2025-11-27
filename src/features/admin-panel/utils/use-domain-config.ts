'use client'

import {
  useGetCustomDomainConfigQuery,
  useGetDomainDefaultQuery,
  useGetDynamicFormQuery,
  usePatchCustomDomainConfigMutation,
  usePatchDomainDefaultMutation,
  useSaveCustomDomainConfigMutation,
} from '@/features/admin-panel/store/admin-panel-api'
import { useCallback, useMemo } from 'react'

type UseDomainConfigOpts = {
  customDomainId?: string | null
}

/**
 * Hook that centralizes the common logic used by both the "default" and "custom" domain pages.
 */
export function useDomainConfig({ customDomainId }: UseDomainConfigOpts) {
  const { data: adminConfig, isLoading: isFormMetaLoading } =
    useGetDynamicFormQuery()

  const { data: domainDefaultData, isLoading: isDefaultLoading } =
    useGetDomainDefaultQuery(undefined, {
      skip: Boolean(customDomainId),
    })

  const { data: customConfigData, isLoading: isCustomLoading } =
    useGetCustomDomainConfigQuery(customDomainId ?? '', {
      skip: !customDomainId,
    })

  const [patchDomainDefault, { isLoading: isPatching }] =
    usePatchDomainDefaultMutation()
  const [saveCustomDomainConfig, { isLoading: isSaving }] =
    useSaveCustomDomainConfigMutation()
  const [patchCustomDomainConfig, { isLoading: isPatchingCustom }] =
    usePatchCustomDomainConfigMutation()

  const isLoading = Boolean(
    isFormMetaLoading || isDefaultLoading || isCustomLoading
  )

  const { tabNames, tabDataByTab } = useMemo(() => {
    const domainArray = adminConfig?.data.domain ?? []

    const names = domainArray.map((entry: Record<string, unknown>) => {
      const sectionKey =
        Object.keys(entry).find((k) => k !== 'is_duplicable') ??
        Object.keys(entry)[0]
      return sectionKey
    })

    const tabData: Record<string, any> = {}

    const defaultSettings = domainDefaultData?.data ?? {}
    const customSettings = customConfigData?.data?.settings ?? {}
    const settings = customDomainId ? customSettings : defaultSettings

    domainArray.forEach((entry: Record<string, any>) => {
      const sectionKey =
        Object.keys(entry).find((k) => k !== 'is_duplicable') ??
        Object.keys(entry)[0]
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

  // unified submit handler with logging + user feedback
  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        console.log('[useDomainConfig] onSubmit values (diff):', values)

        if (customDomainId) {
          // Update existing custom domain via PATCH
          console.log(
            `[useDomainConfig] Patching custom domain ${customDomainId}:`,
            values
          )
          const res = await patchCustomDomainConfig({
            customDomainId: customDomainId.toLowerCase(),
            config: values,
          }).unwrap()
          console.log(
            '[useDomainConfig] patchCustomDomainConfig response:',
            res
          )
          // feedback to user
          alert('Custom domain patched')
          return res
        } else {
          // Default domain: convert arrays to mapped objects for duplicable sections
          const settings = buildSettingsPayload(values)
          console.log('[useDomainConfig] PATCH payload settings:', settings)
          const res = await patchDomainDefault({ config: settings }).unwrap()
          console.log('[useDomainConfig] patchDomainDefault response:', res)
          alert('Default domain patched')
          return res
        }
      } catch (err: any) {
        console.error('[useDomainConfig] Save error:', err)
        // try to show useful message
        const message =
          err?.data?.message || err?.message || String(err) || 'Unknown error'
        alert('Error saving parameters: ' + message)
        throw err
      }
    },
    [
      customDomainId,
      patchCustomDomainConfig,
      saveCustomDomainConfig,
      patchDomainDefault,
      buildSettingsPayload,
    ]
  )

  const isFormLoading = Boolean(isPatching || isSaving || isPatchingCustom)

  return {
    adminConfig,
    tabNames,
    tabDataByTab,
    isLoading,
    isFormLoading,
    handleSubmit,
  }
}
