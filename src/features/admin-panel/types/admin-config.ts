/**
 * Base configuration types for admin panel
 * These types are used throughout the admin panel form system
 */

/**
 * Field constraints defining validation rules
 */
export interface Constraints {
  /** Available choices for select/multi-select fields */
  choices?: string[]
}

/**
 * Origin information indicating where a field value comes from
 */
export interface ConfigOrigin {
  /** The source type of the configuration */
  type: 'default' | 'rule' | 'domain'
  /** Optional ID of the source (for rule/domain) */
  id?: number
  /** Optional name of the source (for display) */
  name?: string
}

/**
 * Supported data types for configuration fields
 */
export type ConfigDataType = 'str' | 'bool' | 'list[str]'

export type SectionMeta = {
  options: ConfigOption[]
  is_duplicable: boolean
}

/**
 * Configuration field option
 * Represents a single field in the admin configuration form
 */
export interface ConfigOption {
  /** Field validation constraints */
  constraints: Constraints | null
  /** Data type of the field */
  data_type: ConfigDataType
  /** Default value for the field */
  default: string | number | boolean | string[] | null
  /** Dependency expression (parent field condition) */
  depends: string | null
  /** Unique field identifier */
  name: string
  /** Whether the field is required */
  required: boolean
  /** Current value (after merge with custom config) */
  value?: string | number | boolean | string[] | null
  /** Origin information for the field value */
  origin?: ConfigOrigin
  /** Child fields that depend on this field */
  children?: ConfigOption[]
}
