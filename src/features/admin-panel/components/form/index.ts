/**
 * Form components type exports
 * Central export point for all form-related types
 */

export type {
  AdminFormProps,
  AdminPanelHeaderProps,
  AdminPanelTabsProps,
  DomainConfigFormPageProps,
  FieldRendererProps,
  FormSchemaResult,
} from '../../types/form'

export { FORM_CONSTANTS } from '../../types/form'

// Re-export commonly used types from admin-config
export type {
  ConfigDataType,
  ConfigOption,
  ConfigOrigin,
  Constraints,
} from '../../types/admin-config'
