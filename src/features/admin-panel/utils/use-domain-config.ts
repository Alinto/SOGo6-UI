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
          let originalKeys: string[] | undefined = undefined

          if (Array.isArray(sectionSettings)) {
            initialValues = sectionSettings
          } else if (
            typeof sectionSettings === 'object' &&
            sectionSettings !== null
          ) {
            // preserve both keys and values so we can map back to original keys later
            try {
              originalKeys = Object.keys(sectionSettings)
              initialValues = JSON.parse(
                JSON.stringify(Object.values(sectionSettings))
              )
            } catch {
              originalKeys = Object.keys(sectionSettings)
              initialValues = Object.values(sectionSettings)
            }
          }
          tabData[sectionKey] = {
            options,
            is_duplicable,
            initial_values: JSON.parse(JSON.stringify(initialValues)),
            current_values: JSON.parse(JSON.stringify(initialValues)),
            // store original keys (if available) to rebuild payload using same server keys
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
            // Prefer to reuse the original server key for this index when available.
            // This avoids renaming keys (e.g. us_french -> ldap_ex) that would cause a full-section diff.
            let keyFromOriginal: string | undefined = undefined
            if (originalKeys && originalKeys[idx] !== undefined) {
              keyFromOriginal = String(originalKeys[idx])
            }

            // If the item is explicitly deleted (null) and we have an original key, ensure we
            // send that original key mapped to null. This guarantees the PATCH contains
            // something like { "USER_SOURCE": { "us_french_2": null } } for deletions.
            if ((item === null || item === undefined) && keyFromOriginal) {
              mapped[keyFromOriginal] = null
              return
            }

            // Otherwise, derive a sensible key from known name fields (US_UID, US_NAME, id, name)
            // or fallback to the index string. If original key exists, prefer it.
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

  // unified submit handler with logging + user feedback
  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        console.log('[useDomainConfig] onSubmit values (full form):', values)

        // Build settings mapping for duplicable sections consistently for both custom and default
        const newSettings = buildSettingsPayload(values)

        // Get the original settings from server data (default or custom)
        const defaultSettings = domainDefaultData?.data ?? {}
        const customSettings = customConfigData?.data?.settings ?? {}
        const originalSettings = customDomainId
          ? customSettings
          : defaultSettings

        // Compute diff between originalSettings (server-shaped) and newSettings (server-shaped)
        const diff = deepDiffNewValues(
          originalSettings,
          newSettings,
          false,
          false
        )
        console.log('[useDomainConfig] computed settings diff:', diff)

        if (!diff || Object.keys(diff).length === 0) {
          alert('No changes detected')
          return null
        }

        if (customDomainId) {
          const payload = {
            domain_info: {
              mail_server: 'texte en dur', //TODO: changer ça
              'user source': 'texte en dur',
            },
            settings: diff,
          }

          const res = await patchCustomDomainConfig({
            customDomainId: customDomainId.toLowerCase(),
            config: payload,
          }).unwrap()
          console.log(
            '[useDomainConfig] patchCustomDomainConfig response:',
            res
          )
          alert('Custom domain patched') //TODO: changer ça
          return res
        } else {
          // Default domain: send only the diff settings
          const res = await patchDomainDefault({ config: diff }).unwrap()
          alert('Default domain patched') //TODO: changer ça
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
      domainDefaultData,
      customConfigData,
    ]
  )

  // New: function to update only domain_description for a custom domain
  const updateDomainDescription = useCallback(
    async (newDescription: string) => {
      if (!customDomainId) {
        throw new Error('updateDomainDescription called without customDomainId')
      }
      try {
        const payload = { domain_description: newDescription }
        console.log(
          `[useDomainConfig] Patching domain_description for ${customDomainId}:`,
          payload
        )
        const res = await patchCustomDomainConfig({
          customDomainId: customDomainId.toLowerCase(),
          config: payload,
        }).unwrap()
        console.log(
          '[useDomainConfig] patchCustomDomainConfig (desc) response:',
          res
        )
        return res
      } catch (err) {
        console.error('[useDomainConfig] updateDomainDescription error:', err)
        throw err
      }
    },
    [customDomainId, patchCustomDomainConfig]
  )

  const isFormLoading = Boolean(isPatching || isSaving || isPatchingCustom)

  // Provide domain description from custom config when available (used by custom domain page)
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
