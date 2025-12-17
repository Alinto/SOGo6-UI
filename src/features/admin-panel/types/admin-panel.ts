/**
 * Admin panel API response types
 * These types represent the structure of API responses for admin configuration
 */

import type { UseFormReturn } from 'react-hook-form'
import type { ConfigOption } from './admin-config'

/**
 * Rule definition from the API
 */
export interface Rule {
  /** Rule ID */
  id: number
  /** Rule name */
  name: string
}

/**
 * Section within admin configuration (domain or system)
 */
export type AdminConfigSection = {
  [sectionName: string]: ConfigOption[]
}

/**
 * Complete admin configuration structure
 */
// export interface AdminConfig {
//   /** Domain-specific configuration section */
//   domain: AdminConfigSection
//   /** System-wide configuration section */
//   system: AdminConfigSection
// }

/**
 * Dropdown option for UI components
 */
export interface DropdownOption {
  /** Display label */
  label: string
  /** Option value */
  value: string
}

// Types for the split components (one component per file)

export type FieldRendererProps = {
  fieldKey: string
  fieldValue: unknown
  form: UseFormReturn<any>
  sectionKey: string
}

export type CollapsibleArrayItemProps = {
  index: number
  item: Record<string, any>
  sectionKey: string
  form: UseFormReturn<any>
}

export type SectionRendererProps = {
  sectionKey: string
  sectionData: unknown
  form: UseFormReturn<any>
}
