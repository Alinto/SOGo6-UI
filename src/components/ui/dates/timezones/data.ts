import type { Timezone } from './types'
import { getTimezones } from './utils'

/**
 * Default timezones list (can be used for server-side or fallback)
 * For client-side usage, prefer using getTimezones(locale) directly
 */
export const timezones: Timezone[] = getTimezones()
