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
import type {
  SectionSettings,
  TabData,
  UseDomainConfigOpts,
} from '@/features/admin-panel/types/form'
import { useCallback, useMemo } from 'react'

/**
 * Deep clone a value (object or array) using JSON serialization.
 * Note: this is a simple clone helper — it won't preserve functions, Dates, Maps, etc.
 */
const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

/**
 * Extract the section key from an admin-config entry object.
 * The admin-config `domain` array contains entries where the section key is the
 * object property (e.g. { "SYSTEM_SETTINGS": [...], "is_duplicable": false }).
 * This helper returns that section key (ignoring the is_duplicable property).
 */
const extractSectionKey = (entry: Record<string, unknown>): string =>
  Object.keys(entry).find((k) => k !== 'is_duplicable') ?? Object.keys(entry)[0]

/**
 * Build the TabData structure for a duplicable section.
 * - If sectionSettings is an array: use it as initial_values/current_values.
 * - If sectionSettings is an object keyed by original keys: extract original_keys and values.
 * - Otherwise return a minimal TabData with options and is_duplicable flag.
 *
 * This prepares the shape expected by the form components for duplicable sections.
 */
const buildDuplicableTabData = (
  sectionSettings: SectionSettings,
  options: unknown[],
  isDuplicable: boolean
): TabData => {
  if (!sectionSettings) {
    return { options, is_duplicable: isDuplicable }
  }

  if (Array.isArray(sectionSettings)) {
    const initialValues = deepClone(sectionSettings)
    return {
      options,
      is_duplicable: isDuplicable,
      initial_values: initialValues,
      current_values: deepClone(initialValues),
    }
  }

  if (typeof sectionSettings === 'object' && sectionSettings !== null) {
    const originalKeys = Object.keys(sectionSettings)
    const initialValues = deepClone(Object.values(sectionSettings))
    return {
      options,
      is_duplicable: isDuplicable,
      initial_values: initialValues,
      current_values: deepClone(initialValues),
      original_keys: deepClone(originalKeys),
    }
  }

  return { options, is_duplicable: isDuplicable }
}

/**
 * Build the TabData structure for a non-duplicable section.
 * - If sectionSettings is an object (not an array) treat it as current_values.
 * - Otherwise return a minimal TabData with options and is_duplicable flag.
 *
 * This prepares the shape expected by the form components for single-instance sections.
 */
const buildNonDuplicableTabData = (
  sectionSettings: SectionSettings,
  options: unknown[],
  isDuplicable: boolean
): TabData => {
  if (
    sectionSettings &&
    typeof sectionSettings === 'object' &&
    !Array.isArray(sectionSettings)
  ) {
    return {
      options,
      is_duplicable: isDuplicable,
      current_values: deepClone(sectionSettings),
    }
  }
  return { options, is_duplicable: isDuplicable }
}

/**
 * Hook that centralizes domain configuration loading, transformation and submit logic.
 *
 * Responsibilities:
 * - load admin form metadata and either default domain settings or a custom domain settings
 * - build `tabNames` and `tabDataByTab` structures consumed by the form UI
 * - provide helpers to transform form values into server-shaped payloads
 * - compute diffs against original settings and call the right API endpoint (default vs custom)
 * - expose loading states and helper to update domain description
 */
export function useDomainConfig({ customDomainId }: UseDomainConfigOpts) {
  // Fetch queries
  const { data: adminConfig, isLoading: isFormMetaLoading } =
    useGetDynamicFormQuery()

  const { data: domainDefaultData, isLoading: isDefaultLoading } =
    useGetDomainDefaultQuery(undefined, {
      skip: Boolean(customDomainId),
    })

  const { data: customConfigData, isLoading: isCustomLoading } =
    useGetCustomDomainConfigQuery(customDomainId ?? '', {
      skip: !customDomainId,
    }) as {
      data?: {
        data?: {
          settings?: Record<string, unknown>
          domain_description?: string
        }
      }
      isLoading: boolean
    }

  // Mutations
  const [patchDomainDefault, { isLoading: isPatching }] =
    usePatchDomainDefaultMutation()
  const [, { isLoading: isSaving }] = useSaveCustomDomainConfigMutation()
  const [patchCustomDomainConfig, { isLoading: isPatchingCustom }] =
    usePatchCustomDomainConfigMutation()

  const isLoading = isFormMetaLoading || isDefaultLoading || isCustomLoading
  const isFormLoading = isPatching || isSaving || isPatchingCustom

  /**
   * Build tab structure from admin config and domain settings.
   *
   * Produces:
   * - tabNames: ordered list of section keys
   * - tabDataByTab: mapping sectionKey -> TabData (options, is_duplicable, initial/current values, original_keys)
   */
  const { tabNames, tabDataByTab } = useMemo(() => {
    // Type assertion to match the actual API response structure
    const domainArray = ((
      adminConfig as unknown as { data?: { domain?: unknown[] } }
    )?.data?.domain ?? []) as Record<string, unknown>[]

    const settings = customDomainId
      ? (customConfigData?.data?.settings ?? {})
      : (domainDefaultData?.data ?? {})

    // Extract tab names using map
    const names = domainArray.map(extractSectionKey)

    // Build tab data using reduce for better performance
    const tabData = domainArray.reduce<Record<string, TabData>>(
      (acc, entry) => {
        const sectionKey = extractSectionKey(entry)
        const options = deepClone(entry[sectionKey] ?? []) as unknown[]
        const isDuplicable = Boolean(entry.is_duplicable)
        const sectionSettings = (settings as Record<string, unknown>)[
          sectionKey
        ] as SectionSettings

        acc[sectionKey] = isDuplicable
          ? buildDuplicableTabData(sectionSettings, options, isDuplicable)
          : buildNonDuplicableTabData(sectionSettings, options, isDuplicable)

        return acc
      },
      {}
    )

    return { tabNames: names, tabDataByTab: tabData }
  }, [adminConfig, domainDefaultData, customConfigData, customDomainId])

  /**
   * Build settings payload shaped like the server expects.
   *
   * - For duplicable sections: convert array -> keyed object using original_keys when present.
   *   If an array slot is `null` and an original_key exists for that index, map that key -> null
   *   (explicit deletion signal for the server).
   * - For non-duplicable sections: pass the value through.
   *
   * Returns an object where each sectionKey maps to the server-shaped value.
   */
  const buildSettingsPayload = useCallback(
    (values: Record<string, unknown>) => {
      return Object.entries(values).reduce<Record<string, unknown>>(
        (settings, [sectionKey, value]) => {
          const sectionMeta = tabDataByTab[sectionKey] as {
            is_duplicable?: boolean
            original_keys?: string[]
          }
          const isDuplicable =
            sectionMeta?.is_duplicable ?? Array.isArray(value)

          if (isDuplicable && Array.isArray(value)) {
            // Convert array to keyed object using reduce
            settings[sectionKey] = value.reduce<Record<string, unknown>>(
              (mapped, item, idx) => {
                const originalKeys = sectionMeta?.original_keys
                const keyFromOriginal =
                  originalKeys?.[idx] !== undefined
                    ? String(originalKeys[idx])
                    : undefined

                // Explicit deletion: send original key => null
                if ((item === null || item === undefined) && keyFromOriginal) {
                  mapped[keyFromOriginal] = null
                  return mapped
                }

                // Infer key from item properties or use index
                const itemObj = item as Record<string, unknown>
                const inferredKey =
                  itemObj?.US_UID ??
                  itemObj?.US_NAME ??
                  itemObj?.id ??
                  itemObj?.name ??
                  `${idx}`
                const key = keyFromOriginal ?? String(inferredKey)
                mapped[key] = item

                return mapped
              },
              {}
            )
          } else {
            settings[sectionKey] = value
          }

          return settings
        },
        {}
      )
    },
    [tabDataByTab]
  )

  /**
   * Helper: Build domain_info for USER_SOURCE updates.
   *
   * If the diff contains USER_SOURCE mapped object, return a domain_info object
   * with a user_source CSV listing the keys that are not null/undefined.
   * Returns undefined if no USER_SOURCE change or no keys.
   */
  const buildDomainInfo = useCallback((diff: Record<string, unknown>) => {
    if (!Object.prototype.hasOwnProperty.call(diff, 'USER_SOURCE')) {
      return undefined
    }

    const usObj = diff.USER_SOURCE
    if (!usObj || typeof usObj !== 'object' || Array.isArray(usObj)) {
      return undefined
    }

    const keys = Object.keys(usObj as Record<string, unknown>).filter(
      (k) =>
        (usObj as Record<string, unknown>)[k] !== null &&
        (usObj as Record<string, unknown>)[k] !== undefined
    )

    return keys.length > 0 ? { user_source: keys.join(',') } : undefined
  }, [])

  /**
   * Submit handler for the domain form.
   *
   * Steps:
   * - transform the form `values` into server-shaped `settings` using buildSettingsPayload
   * - compute the diff vs originalSettings using deepDiffNewValues
   * - if diff is empty do nothing
   * - choose the correct endpoint:
   *   - custom domains: patchCustomDomainConfig (may include domain_info)
   *   - default domain: patchDomainDefault
   * - bubble up errors after logging/alerting
   */
  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        const newSettings = buildSettingsPayload(values)

        const originalSettings = customDomainId
          ? (customConfigData?.data?.settings ?? {})
          : (domainDefaultData?.data ?? {})

        const diff = deepDiffNewValues(
          originalSettings,
          newSettings,
          false,
          false
        )

        if (!diff || Object.keys(diff).length === 0) {
          return null
        }

        if (customDomainId) {
          const domainInfo = buildDomainInfo(diff)
          const payload: Record<string, unknown> = domainInfo
            ? { domain_info: domainInfo, settings: diff }
            : { settings: diff }

          const res = await patchCustomDomainConfig({
            customDomainId: customDomainId.toLowerCase(),
            config: payload,
          }).unwrap()
          alert('Custom domain patched') //TODO:
          return res
        } else {
          const res = await patchDomainDefault({ config: diff }).unwrap()
          alert('Default domain patched') //TODO:
          return res
        }
      } catch (err) {
        const error = err as { data?: { message?: string }; message?: string }
        const message =
          error?.data?.message ||
          error?.message ||
          String(err) ||
          'Unknown error'
        console.error('[useDomainConfig] Save error:', err)
        alert('Error saving parameters: ' + message)
        throw err
      }
    },
    [
      customDomainId,
      patchCustomDomainConfig,
      patchDomainDefault,
      buildSettingsPayload,
      buildDomainInfo,
      domainDefaultData,
      customConfigData,
    ]
  )

  /**
   * Update only the domain_description for a custom domain.
   *
   * Requires customDomainId. Calls the patchCustomDomainConfig mutation with
   * a payload containing only the domain_description field.
   */
  const updateDomainDescription = useCallback(
    async (newDescription: string) => {
      if (!customDomainId) {
        throw new Error('updateDomainDescription requires customDomainId')
      }

      try {
        const res = await patchCustomDomainConfig({
          customDomainId: customDomainId.toLowerCase(),
          config: { domain_description: newDescription },
        }).unwrap()
        return res
      } catch (err) {
        console.error('[useDomainConfig] updateDomainDescription error:', err)
        throw err
      }
    },
    [customDomainId, patchCustomDomainConfig]
  )

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
