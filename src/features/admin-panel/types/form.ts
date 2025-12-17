/**
 * Type definitions for Admin Panel Form Components
 * Centralizes all form-related types and interfaces
 */

import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ConfigOption } from './admin-config'

/**
 * Props for the main AdminDomainFormFrame component
 */
export interface AdminFormProps {
  /** Configuration options data to render */
  //data: ConfigOption[] | undefined
  data: Record<string, unknown> | null // Changed from ConfigOption[]
  /** Callback when form is submitted with form values */
  onSubmit: (_values: Record<string, unknown>) => void
  /** Loading state for submit button */
  isLoading?: boolean
  /** Optional form title */
  title?: string
  /** Optional form description */
  description?: string
}

// export interface AdminFormProps {
//   data: Record<string, unknown> | null  // Changed from ConfigOption[]
//   onSubmit: (values: Record<string, unknown>) => void
//   isLoading?: boolean
// }

/**
 * Props for the recursive FieldRenderer component
 */
export interface FieldRendererProps {
  /** Configuration item to render */
  item: ConfigOption
  /** React Hook Form instance */
  form: UseFormReturn<Record<string, unknown>>
  /** Current nesting depth for indentation (0 = root level) */
  depth?: number
  /** Whether this is the last item in its sibling group */
  isLast?: boolean
}

/**
 * Props for the DomainConfigFormPage component
 */
export interface DomainConfigFormPageProps {
  /** Name of the domain being configured */
  domainName: string
  /** Array of tab names to display */
  tabNames: string[]
  /** Configuration data organized by tab
   */
  tabDataByTab: Record<string, unknown>
  /** Callback when form is submitted */
  onSubmit: (_values: Record<string, unknown>) => Promise<void> | void
  /** Loading state for the entire page */
  isLoading?: boolean
  /** Loading state specifically for the form */
  isFormLoading?: boolean
}

/**
 * Props for the AdminPanelHeader component
 */
export interface AdminPanelHeaderProps {
  /** Header title text */
  title?: string
  /** Optional description text */
  description?: string
}

/**
 * Props for the AdminPanelTabs component
 */
export interface AdminPanelTabsProps {
  /** Array of tab names to render */
  tabNames: string[]
  /** Currently active tab name */
  activeTab: string
  /** Callback when tab is changed */
  onTabChange: (_tab: string) => void
}

/**
 * Form field renderer result
 * Returned by renderDynamicComponent utility
 */
export type FieldComponent = ReactElement

/**
 * Form schema creation result
 * Contains both the Zod schema and default values
 */
export interface FormSchemaResult {
  /** Zod validation schema */
  schema: import('zod').ZodObject<Record<string, import('zod').ZodTypeAny>>
  /** Default form values */
  defaultValues: Record<string, unknown>
}

/**
 * Type for form constants
 */
export const FORM_CONSTANTS = {
  /** Indicator for required fields */
  REQUIRED_INDICATOR: '*',
  /** Visual indicator for child fields */
  CHILD_INDICATOR: '└─',
  /** Indentation per depth level in pixels */
  INDENTATION_PX: 24,
} as const

export type FormConstants = typeof FORM_CONSTANTS

/**
 * Options for the useDomainConfig hook
 */
export type UseDomainConfigOpts = {
  customDomainId?: string | null
}

/** Type for section settings data for useDomainConfig*/
export type SectionSettings = Record<string, unknown> | unknown[] | undefined

/** Type for tab data for useDomainConfig*/
export type TabData = Record<string, unknown>
