'use client'

import { deepDiffNewValues } from '@/components/ui/forms/utils'
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
 * Hook that centralizes domain configuration loading, transformation and submit logic.
 * It returns form metadata (tabs + data), loading states, and handlers to submit changes
 * or update the domain description.
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

  /**
   * Build a stable structure:
   * - tabNames: ordered list of section keys
   * - tabDataByTab: map sectionKey => metadata (options, is_duplicable, initial/current values, original_keys)
   *
   * This memo keeps the logic compact and readable while preserving previous behaviour.
   */
  const { tabNames, tabDataByTab } = useMemo(() => {
    const domainArray = (adminConfig?.data?.domain ?? []) as Record<
      string,
      any
    >[]

    const names = domainArray.map((entry) => {
      const sectionKey =
        Object.keys(entry).find((k) => k !== 'is_duplicable') ??
        Object.keys(entry)[0]
      return sectionKey
    })

    const tabData: Record<string, any> = {}

    const defaultSettings = domainDefaultData?.data ?? {}
    const customSettings = customConfigData?.data?.settings ?? {}
    const settings = customDomainId ? customSettings : defaultSettings

    domainArray.forEach((entry) => {
      const sectionKey =
        Object.keys(entry).find((k) => k !== 'is_duplicable') ??
        Object.keys(entry)[0]
      const origOptions = (entry[sectionKey] ?? []) as any[]
      const options = origOptions.map((o) => ({ ...(o ?? {}) }))
      const is_duplicable = Boolean(entry.is_duplicable)

      const sectionSettings = settings
        ? (settings as any)[sectionKey]
        : undefined

      if (is_duplicable) {
        if (sectionSettings) {
          let initialValues: any[] = []
          let originalKeys: string[] | undefined = undefined

          if (Array.isArray(sectionSettings)) {
            // already array - keep as-is
            initialValues = JSON.parse(JSON.stringify(sectionSettings))
          } else if (
            typeof sectionSettings === 'object' &&
            sectionSettings !== null
          ) {
            // object mapping: preserve keys and values (we'll rebuild payload using original_keys)
            originalKeys = Object.keys(sectionSettings)
            initialValues = JSON.parse(
              JSON.stringify(Object.values(sectionSettings))
            )
          }

          tabData[sectionKey] = {
            options,
            is_duplicable,
            initial_values: initialValues,
            current_values: JSON.parse(JSON.stringify(initialValues)),
            ...(originalKeys
              ? { original_keys: JSON.parse(JSON.stringify(originalKeys)) }
              : {}),
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

  /**
   * Build settings payload shaped like the server expects.
   * - For duplicable sections: convert array -> keyed object using original_keys when present.
   * - For non-duplicable: pass the value directly.
   */
  const buildSettingsPayload = useCallback(
    (values: Record<string, unknown>) => {
      const settings: Record<string, any> = {}

      Object.entries(values).forEach(([sectionKey, value]) => {
        const sectionMeta = (tabDataByTab as any)[sectionKey]
        const isDuplicable = sectionMeta?.is_duplicable ?? Array.isArray(value)

        if (isDuplicable && Array.isArray(value)) {
          const arr = value as any[]
          const mapped: Record<string, any> = {}
          const originalKeys: string[] | undefined = sectionMeta?.original_keys

          arr.forEach((item: any, idx: number) => {
            let keyFromOriginal: string | undefined = undefined
            if (originalKeys && originalKeys[idx] !== undefined) {
              keyFromOriginal = String(originalKeys[idx])
            }

            if ((item === null || item === undefined) && keyFromOriginal) {
              // explicit deletion slot -> send original key => null
              mapped[keyFromOriginal] = null
              return
            }

            const inferredKey =
              item && (item.US_UID ?? item.US_NAME ?? item.id ?? item.name)
                ? (item.US_UID ?? item.US_NAME ?? item.id ?? item.name)
                : `${idx}`
            const key = keyFromOriginal ?? String(inferredKey)
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

  /**
   * Submit handler for the domain form.
   * - Builds server-shaped settings
   * - Computes diff vs original settings
   * - Calls the appropriate patch endpoint (custom vs default)
   */
  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        // Build server-shaped settings
        const newSettings = buildSettingsPayload(values)

        const defaultSettings = domainDefaultData?.data ?? {}
        const customSettings = customConfigData?.data?.settings ?? {}
        const originalSettings = customDomainId
          ? customSettings
          : defaultSettings

        const diff = deepDiffNewValues(
          originalSettings,
          newSettings,
          false,
          false
        )

        if (!diff || Object.keys(diff).length === 0) {
          alert('No changes detected')
          return null
        }

        if (customDomainId) {
          // preserve previous behaviour: send settings under "settings" and include domain_info if needed
          const payload = {
            domain_info: {
              // TODO: replace hardcoded placeholders with actual fields when available
              mail_server: 'texte en dur',
              'user source': 'texte en dur',
            },
            settings: diff,
          }

          const res = await patchCustomDomainConfig({
            customDomainId: customDomainId.toLowerCase(),
            config: payload,
          }).unwrap()
          alert('Custom domain patched')
          return res
        } else {
          // Default domain: send patch to domain-default endpoint with only the diff
          const res = await patchDomainDefault({ config: diff }).unwrap()
          alert('Default domain patched')
          return res
        }
      } catch (err: any) {
        console.error('[useDomainConfig] Save error:', err)
        const message =
          err?.data?.message || err?.message || String(err) || 'Unknown error'
        alert('Error saving parameters: ' + message)
        throw err
      }
    },
    [
      customDomainId,
      patchCustomDomainConfig,
      patchDomainDefault,
      buildSettingsPayload,
      domainDefaultData,
      customConfigData,
    ]
  )

  /**
   * Update only the domain_description for a custom domain.
   * Throws if no customDomainId is provided.
   */
  const updateDomainDescription = useCallback(
    async (newDescription: string) => {
      if (!customDomainId) {
        throw new Error('updateDomainDescription called without customDomainId')
      }
      try {
        const payload = { domain_description: newDescription }
        const res = await patchCustomDomainConfig({
          customDomainId: customDomainId.toLowerCase(),
          config: payload,
        }).unwrap()
        return res
      } catch (err) {
        console.error('[useDomainConfig] updateDomainDescription error:', err)
        throw err
      }
    },
    [customDomainId, patchCustomDomainConfig]
  )

  const isFormLoading = Boolean(isPatching || isSaving || isPatchingCustom)

  const domainDescription = customConfigData?.data?.domain_description

  return {
    adminConfig,
    tabNames,
    tabDataByTab,
    isLoading,
    isFormLoading,
    handleSubmit,
    domainDescription,
    updateDomainDescription,
  }
}
